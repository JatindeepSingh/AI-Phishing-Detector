/*
 * Pattern & Plagiarism Detector
 * Implements: Rabin-Karp, KMP (Knuth-Morris-Pratt), Boyer-Moore
 * Output: JSON for frontend consumption
 */

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <chrono>
#include <algorithm>
#include "../include/algorithms.h"
#include "../include/json_output.h"

// ─────────────────────────────────────────────
//  Utility: read file to string
// ─────────────────────────────────────────────
std::string readFile(const std::string& path) {
    std::ifstream f(path);
    if (!f.is_open()) return "";
    std::ostringstream ss;
    ss << f.rdbuf();
    return ss.str();
}

// ─────────────────────────────────────────────
//  Utility: compute similarity score (0-100)
// ─────────────────────────────────────────────
double computeSimilarity(int matches, const std::string& text, const std::string& pattern) {
    if (text.empty() || pattern.empty()) return 0.0;
    double coverage = (double)(matches * pattern.size()) / text.size() * 100.0;
    return std::min(coverage, 100.0);
}

// ─────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────
int main(int argc, char* argv[]) {
    // Usage: detector <text_file_or_string> <pattern> [--file]
    // Returns JSON to stdout

    if (argc < 3) {
        std::cerr << "{\"error\": \"Usage: detector <text> <pattern> [--file]\"}\n";
        return 1;
    }

    std::string text;
    std::string pattern = argv[2];
    bool useFile = (argc >= 4 && std::string(argv[3]) == "--file");

    if (useFile) {
        text = readFile(argv[1]);
        if (text.empty()) {
            std::cerr << "{\"error\": \"Could not read file or file is empty\"}\n";
            return 1;
        }
    } else {
        text = argv[1];
    }

    // ── Run each algorithm and time it ──────────
    AlgorithmResult rkResult, kmpResult, bmResult;

    // Rabin-Karp
    {
        auto start = std::chrono::high_resolution_clock::now();
        rkResult.matches = rabinKarp(text, pattern);
        auto end = std::chrono::high_resolution_clock::now();
        rkResult.name = "Rabin-Karp";
        rkResult.timeUs = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
        rkResult.matchCount = (int)rkResult.matches.size();
    }

    // KMP
    {
        auto start = std::chrono::high_resolution_clock::now();
        kmpResult.matches = kmpSearch(text, pattern);
        auto end = std::chrono::high_resolution_clock::now();
        kmpResult.name = "KMP";
        kmpResult.timeUs = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
        kmpResult.matchCount = (int)kmpResult.matches.size();
    }

    // Boyer-Moore
    {
        auto start = std::chrono::high_resolution_clock::now();
        bmResult.matches = boyerMoore(text, pattern);
        auto end = std::chrono::high_resolution_clock::now();
        bmResult.name = "Boyer-Moore";
        bmResult.timeUs = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
        bmResult.matchCount = (int)bmResult.matches.size();
    }

    // Use KMP matches as canonical (all three should agree)
    int totalMatches = kmpResult.matchCount;
    double similarity = computeSimilarity(totalMatches, text, pattern);

    // ── Build & emit JSON ────────────────────────
    outputJSON(text, pattern, {rkResult, kmpResult, bmResult}, similarity);

    return 0;
}