#pragma once
#include <string>
#include <vector>
#include "algorithms.h"

void outputJSON(
    const std::string&              text,
    const std::string&              pattern,
    const std::vector<AlgorithmResult>& results,
    double                          similarity
);