#!/usr/bin/env bash
# QA smoke test — automatable bits of docs/QA.md.
# Runs in ~5s. Exit 0 on green, exit 1 on any red.
#
# Usage:
#   ./scripts/qa-smoke.sh                          # tests prod
#   ./scripts/qa-smoke.sh https://localhost:3000   # tests local dev
#   ./scripts/qa-smoke.sh https://staging...       # tests anything else

# No `pipefail` here: the content checks rely on `body | grep -q PATTERN`,
# and `grep -q` exits early once it finds the match. That sends SIGPIPE to
# the upstream curl, which exits non-zero — under pipefail the whole pipe
# then reads as a failure even though grep found what it was looking for.
# The race depends on response size + timing, so it shows up intermittently.
set -u

BASE_URL="${1:-https://hlp.everyphere.com}"
BASE_URL="${BASE_URL%/}"

PASS=0
FAIL=0

green() { printf '\033[0;32m%s\033[0m' "$1"; }
red()   { printf '\033[0;31m%s\033[0m' "$1"; }
gray()  { printf '\033[0;90m%s\033[0m' "$1"; }

check() {
  local label="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    printf '  %s %s\n' "$(green '✓')" "$label"
    PASS=$((PASS + 1))
  else
    printf '  %s %s\n' "$(red '✗')" "$label"
    FAIL=$((FAIL + 1))
  fi
}

# Returns the HTTP code for a URL, no follow-redirects.
status() { curl -sS -o /dev/null -w '%{http_code}' "$1"; }
# Returns the redirect target, no follow.
redirect() { curl -sS -o /dev/null -w '%{redirect_url}' "$1"; }
# Returns the body.
body() { curl -sSL "$1"; }

printf '\nQA smoke against %s\n\n' "$(gray "$BASE_URL")"

printf 'Routes return 200:\n'
check "GET /"                              "[ \"\$(status '$BASE_URL/')\" = '200' ]"
check "GET /browse/greece-north"           "[ \"\$(status '$BASE_URL/browse/greece-north')\" = '200' ]"
check "GET /photos/IJNTMZSP09"             "[ \"\$(status '$BASE_URL/photos/IJNTMZSP09')\" = '200' ]"
check "GET /pages/about-this-site"         "[ \"\$(status '$BASE_URL/pages/about-this-site')\" = '200' ]"
check "GET /search"                        "[ \"\$(status '$BASE_URL/search')\" = '200' ]"
check "GET /news"                          "[ \"\$(status '$BASE_URL/news')\" = '200' ]"
check "GET /gone"                          "[ \"\$(status '$BASE_URL/gone')\" = '200' ]"

printf '\nLegacy ASP redirects:\n'
check "/search.asp → /search"              "[ \"\$(redirect '$BASE_URL/search.asp')\" = '$BASE_URL/search' ]"
check "/whats_new.asp → /news"             "[ \"\$(redirect '$BASE_URL/whats_new.asp')\" = '$BASE_URL/news' ]"
check "/go.asp?img=TWCSSM20 → /photos/…"   "[ \"\$(redirect '$BASE_URL/go.asp?img=TWCSSM20')\" = '$BASE_URL/photos/TWCSSM20' ]"
check "/browse.asp?SiteID=96 → /browse/hazor" \
    "[ \"\$(redirect '$BASE_URL/browse.asp?SiteID=96')\" = '$BASE_URL/browse/hazor' ]"

printf '\nOrphan + relative-depth handling:\n'
check "/browse.asp?SiteID=99999 → /gone"   "redirect '$BASE_URL/browse.asp?SiteID=99999' | grep -q '/gone'"
check "deep relative .asp → /gone"         "redirect '$BASE_URL/browse/foo/browse.asp?SiteID=99999' | grep -q '/gone'"

printf '\nContent + edge cases:\n'
check "Photo page has 'Added: YYYY'"       "body '$BASE_URL/photos/IJNTMZSP09' | grep -qE 'Added: 20[0-9]{2}'"
check "Unknown slug → 404 (not 500)"       "[ \"\$(status '$BASE_URL/browse/this-does-not-exist')\" = '404' ]"
check "/gone has 'no longer available'"    "body '$BASE_URL/gone' | grep -qi 'no longer available'"
check "Logged-out has no 'Edit' nav link"  "! body '$BASE_URL/' | grep -oE '<a[^>]*href=\"/admin[^\"]*\"[^>]*>Edit</a>' | grep -q ."

printf '\nOpen Graph + Schema.org tags:\n'
check "Homepage has og:image"              "body '$BASE_URL/' | grep -qE '<meta[^>]*property=\"og:image\"[^>]*content='"
check "Homepage has og:title"              "body '$BASE_URL/' | grep -qE '<meta[^>]*property=\"og:title\"[^>]*content='"
check "Photo page has og:image"            "body '$BASE_URL/photos/IJNTMZSP09' | grep -qE '<meta[^>]*property=\"og:image\"[^>]*content='"
check "Photo page has ImageObject JSON-LD" "body '$BASE_URL/photos/IJNTMZSP09' | grep -q '\"@type\":\"ImageObject\"'"

printf '\n%s passed, %s failed\n' "$(green $PASS)" "$([ $FAIL -gt 0 ] && red $FAIL || gray 0)"

[ $FAIL -eq 0 ] && exit 0 || exit 1
