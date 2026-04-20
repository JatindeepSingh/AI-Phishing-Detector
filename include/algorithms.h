#pragma once
#include <string>
#include <vector>
struct AlgorithmResult {
    std::string        name;
    std::vector<int>   matches;   // starting positions (0-indexed)
    int                matchCount = 0;
    long long          timeUs     = 0; // microseconds
};
std::vector<int> rabinKarp(const std::string& text, const std::string& pattern);
std::vector<int> kmpSearch(const std::string& text, const std::string& pattern);
std::vector<int> boyerMoore(const std::string& text, const std::string& pattern);