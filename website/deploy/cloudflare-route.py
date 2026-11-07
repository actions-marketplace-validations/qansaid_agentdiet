#!/usr/bin/env python3
"""
Publish the AgentDiet site through the existing Cloudflare Tunnel.

Remote-managed tunnels keep their ingress rules in Cloudflare, not on disk, so
this script merges one hostname into the tunnel's live configuration instead of
replacing it — overwriting the config would take down every other service the
same tunnel serves.

Usage:
    export CF_API_TOKEN=...                # scopes below
    ./cloudflare-route.py --dry-run        # show the merged config, write nothing
    ./cloudflare-route.py                  # tunnel rule + proxied DNS record

Flags:
    --dry-run      print the result of the merge and exit
    --tunnel-only  configure the tunnel ingress only
    --dns-only     create/update the DNS record only

Token scopes (least privilege):
    Account  → Cloudflare Tunnel : Edit
    Zone     → DNS               : Edit
    Zone     → Zone              : Read

Idempotent: re-running replaces only the AgentDiet rule and the AgentDiet DNS
record, and leaves every other rule and record untouched.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"

ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "0c25ea1bc1ae493bb1c6d95cecac5d78")
TUNNEL_ID = os.environ.get("CF_TUNNEL_ID", "393ffb05-a06b-40ad-851f-4417f465c431")
ZONE_NAME = os.environ.get("CF_ZONE", "qansa.web.id")
HOSTNAME = os.environ.get("CF_HOSTNAME", "agentdiet.qansa.web.id")
SERVICE = os.environ.get("CF_SERVICE", "http://localhost:4330")


def call(method: str, path: str, body: dict | None = None, token: str | None = None):
    token = token or os.environ.get("CF_API_TOKEN")
    if not token:
        sys.exit("CF_API_TOKEN is not set")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            payload = json.load(r)
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        sys.exit(f"HTTP {e.code} on {method} {path}\n{detail}")
    if not payload.get("success", False):
        sys.exit(f"API error on {method} {path}\n{json.dumps(payload.get('errors'), indent=2)}")
    return payload["result"]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="print the intended change only")
    ap.add_argument("--dns-only", action="store_true", help="skip the tunnel config, only set the DNS record")
    ap.add_argument("--tunnel-only", action="store_true", help="skip the DNS record, only set the tunnel config")
    args = ap.parse_args()

    zones = call("GET", f"/zones?name={ZONE_NAME}")
    if not zones:
        sys.exit(f"zone {ZONE_NAME} not visible to this token")
    zone_id = zones[0]["id"]
    print(f"zone      {ZONE_NAME}  ({zone_id})")

    if args.dns_only:
        ensure_dns(zone_id, args.dry_run)
        return

    cfg_path = f"/accounts/{ACCOUNT_ID}/cfd_tunnel/{TUNNEL_ID}/configurations"
    current = call("GET", cfg_path)["config"]
    before = current.get("ingress", [])
    print(f"tunnel    {TUNNEL_ID}  ({len(before)} existing ingress rule(s))")

    # Keep everything except an earlier AgentDiet rule and the catch-all, then
    # re-insert ours immediately before the catch-all (it must stay last).
    kept, catch_all = [], []
    for rule in before:
        if rule.get("hostname") == HOSTNAME:
            continue
        if "hostname" in rule:
            kept.append(rule)
        else:
            catch_all.append(rule)
    if not catch_all:
        catch_all = [{"service": "http_status:404"}]

    ours = {"hostname": HOSTNAME, "service": SERVICE}
    merged = {"ingress": kept + [ours] + catch_all}
    if current.get("originRequest"):
        merged["originRequest"] = current["originRequest"]

    print("\nrule to add:")
    print(json.dumps(ours, indent=2))
    print("\nresulting ingress:")
    for r in merged["ingress"]:
        print("  ", r.get("hostname", "*"), "->", r.get("service"))

    if args.dry_run:
        print("\n[dry-run] nothing written")
        return

    call("PUT", cfg_path, {"config": merged})
    print("\ntunnel configuration updated")

    if args.tunnel_only:
        return

    ensure_dns(zone_id, args.dry_run)


def ensure_dns(zone_id: str, dry_run: bool) -> None:
    target = f"{TUNNEL_ID}.cfargotunnel.com"
    records = call("GET", f"/zones/{zone_id}/dns_records?name={HOSTNAME}")
    if dry_run:
        verb = "update" if records else "create"
        print(f"[dry-run] would {verb} CNAME {HOSTNAME} -> {target} (proxied)")
        return
    record = {
        "type": "CNAME",
        "name": HOSTNAME,
        "content": target,
        "proxied": True,
        "ttl": 1,
        "comment": "AgentDiet site via homelab tunnel",
    }
    if records:
        call("PUT", f"/zones/{zone_id}/dns_records/{records[0]['id']}", record)
        print(f"dns       CNAME {HOSTNAME} -> {target} (updated)")
    else:
        call("POST", f"/zones/{zone_id}/dns_records", record)
        print(f"dns       CNAME {HOSTNAME} -> {target} (created)")

    print("\ndone. The edge takes a few seconds to propagate; verify with:")
    print(f"  curl -sI https://{HOSTNAME}")


if __name__ == "__main__":
    main()
