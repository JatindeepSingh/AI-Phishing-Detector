#include "../include/algorithms.h"
#include <string>
#include <vector>

/*
 * Rabin-Karp Algorithm
 * ────────────────────
 * Uses a rolling polynomial hash to find pattern in text.
 * When hashes match, verifies character-by-character (spurious hit check).
 *
 * Time  : O(n+m) average, O(nm) worst case (many hash collisions)
 * Space : O(1)
 */

static const long long BASE = 31;
static const long long MOD  = 1e9 + 9;

std::vector<int> rabinKarp(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    int n = (int)text.size();
    int m = (int)pattern.size();
    if (m == 0 || m > n) return result;

    // Precompute BASE^(m-1) mod MOD
    long long h = 1;
    for (int i = 0; i < m - 1; i++)
        h = (h * BASE) % MOD;

    // Compute hash of pattern and first window of text
    long long patHash  = 0;
    long long textHash = 0;
    for (int i = 0; i < m; i++) {
        patHash  = (patHash  * BASE + (pattern[i] - 'a' + 1)) % MOD;
        textHash = (textHash * BASE + (text[i]    - 'a' + 1)) % MOD;
    }

    for (int i = 0; i <= n - m; i++) {
        if (patHash == textHash) {
            // Verify to avoid spurious hits
            bool match = true;
            for (int j = 0; j < m; j++) {
                if (text[i + j] != pattern[j]) { match = false; break; }
            }
            if (match) result.push_back(i);
        }
        // Roll hash to next window
        if (i < n - m) {
            textHash = (BASE * (textHash - (text[i] - 'a' + 1) * h)
                        + (text[i + m] - 'a' + 1)) % MOD;
            if (textHash < 0) textHash += MOD;
        }
    }
    return result;
}