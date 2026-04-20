#include "../include/json_output.h"
#include <iostream>
#include <string>
#include <vector>
#include <sstream>

// ─────────────────────────────────────────────
//  Escape special JSON characters in a string
// ─────────────────────────────────────────────
static std::string jsonEscape(const std::string& s) {
    std::ostringstream o;
    for (char c : s) {
        switch (c) {
            case '"':  o << "\\\""; break;
            case '\\': o << "\\\\"; break;
            case '\n': o << "\\n";  break;
            case '\r': o << "\\r";  break;
            case '\t': o << "\\t";  break;
            default:
                if ((unsigned char)c < 0x20) {
                    o << "\\u";
                    o.width(4); o.fill('0');
                    o << std::hex << (int)(unsigned char)c << std::dec;
                } else {
                    o << c;
                }
        }
    }
    return o.str();
}

// ─────────────────────────────────────────────
//  Output full JSON result to stdout
// ─────────────────────────────────────────────
void outputJSON(
    const std::string&                  text,
    const std::string&                  pattern,
    const std::vector<AlgorithmResult>& results,
    double                              similarity
) {
    // Find match positions from first algorithm that has results
    const std::vector<int>* matchPositions = nullptr;
    for (auto& r : results) {
        if (!r.matches.empty()) { matchPositions = &r.matches; break; }
    }

    std::cout << "{\n";
    std::cout << "  \"text\": \""    << jsonEscape(text)    << "\",\n";
    std::cout << "  \"pattern\": \"" << jsonEscape(pattern) << "\",\n";
    std::cout << "  \"similarity\": " << similarity << ",\n";

    // Match positions array
    std::cout << "  \"matchPositions\": [";
    if (matchPositions) {
        for (int i = 0; i < (int)matchPositions->size(); i++) {
            if (i > 0) std::cout << ", ";
            std::cout << (*matchPositions)[i];
        }
    }
    std::cout << "],\n";
    std::cout << "  \"matchCount\": "
              << (matchPositions ? (int)matchPositions->size() : 0) << ",\n";

    // Per-algorithm results
    std::cout << "  \"algorithms\": [\n";
    for (int i = 0; i < (int)results.size(); i++) {
        const auto& r = results[i];
        std::cout << "    {\n";
        std::cout << "      \"name\": \""      << r.name       << "\",\n";
        std::cout << "      \"matchCount\": "  << r.matchCount << ",\n";
        std::cout << "      \"timeUs\": "      << r.timeUs     << ",\n";
        std::cout << "      \"matches\": [";
        for (int j = 0; j < (int)r.matches.size(); j++) {
            if (j > 0) std::cout << ", ";
            std::cout << r.matches[j];
        }
        std::cout << "]\n";
        std::cout << "    }";
        if (i + 1 < (int)results.size()) std::cout << ",";
        std::cout << "\n";
    }
    std::cout << "  ]\n";
    std::cout << "}\n";
}