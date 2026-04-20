#include "../include/algorithms.h"
#include <string>
#include <vector>
#include <algorithm>

/*
 * Boyer-Moore Algorithm
 * ──────────────────────
 * Scans pattern right-to-left using two heuristics:
 *   1. Bad Character Rule  — skip based on last occurrence of mismatched char
 *   2. Good Suffix Rule    — skip based on already-matched suffix
 *
 * Time  : O(n/m) best case, O(nm) worst, O(n+m) preprocessing
 * Space : O(σ + m) where σ = alphabet size
 */

static const int ALPHABET = 256;

// Bad Character Table
static std::vector<int> buildBadChar(const std::string& pattern) {
    std::vector<int> bc(ALPHABET, -1);
    for (int i = 0; i < (int)pattern.size(); i++)
        bc[(unsigned char)pattern[i]] = i;
    return bc;
}

// Good Suffix Table
static void buildGoodSuffix(const std::string& pattern, std::vector<int>& shift) {
    int m = (int)pattern.size();
    std::vector<int> border(m + 1, 0);
    shift.assign(m + 1, 0);

    int i = m, j = m + 1;
    border[i] = j;
    while (i > 0) {
        while (j <= m && pattern[i - 1] != pattern[j - 1]) {
            if (shift[j] == 0) shift[j] = j - i;
            j = border[j];
        }
        border[--i] = --j;
    }

    j = border[0];
    for (i = 0; i <= m; i++) {
        if (shift[i] == 0) shift[i] = j;
        if (i == j) j = border[j];
    }
}

std::vector<int> boyerMoore(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    int n = (int)text.size();
    int m = (int)pattern.size();
    if (m == 0 || m > n) return result;

    std::vector<int> badChar = buildBadChar(pattern);
    std::vector<int> goodShift;
    buildGoodSuffix(pattern, goodShift);

    int s = 0;
    while (s <= n - m) {
        int j = m - 1;

        while (j >= 0 && pattern[j] == text[s + j])
            j--;

        if (j < 0) {
            result.push_back(s);
            s += goodShift[0];
        } else {
            int bcShift = j - badChar[(unsigned char)text[s + j]];
            int gsShift = goodShift[j + 1];
            s += std::max(1, std::max(bcShift, gsShift));
        }
    }
    return result;
}