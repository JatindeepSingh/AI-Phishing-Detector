#include "../include/algorithms.h"
#include <string>
#include <vector>

/*
 * Knuth-Morris-Pratt (KMP) Algorithm
 * ────────────────────────────────────
 * Preprocesses pattern to build a failure (partial match) table.
 * Avoids re-examining characters after a mismatch.
 *
 * Time  : O(n + m) always
 * Space : O(m) for the failure table
 */

// Build LPS (Longest Proper Prefix which is also Suffix) array
static std::vector<int> buildLPS(const std::string& pattern) {
    int m = (int)pattern.size();
    std::vector<int> lps(m, 0);
    int len = 0;
    int i   = 1;

    while (i < m) {
        if (pattern[i] == pattern[len]) {
            lps[i++] = ++len;
        } else {
            if (len != 0)
                len = lps[len - 1];
            else
                lps[i++] = 0;
        }
    }
    return lps;
}

std::vector<int> kmpSearch(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    int n = (int)text.size();
    int m = (int)pattern.size();
    if (m == 0 || m > n) return result;

    std::vector<int> lps = buildLPS(pattern);

    int i = 0; // index into text
    int j = 0; // index into pattern

    while (i < n) {
        if (text[i] == pattern[j]) {
            i++; j++;
        }
        if (j == m) {
            result.push_back(i - j); // match found
            j = lps[j - 1];
        } else if (i < n && text[i] != pattern[j]) {
            if (j != 0)
                j = lps[j - 1];
            else
                i++;
        }
    }
    return result;
}