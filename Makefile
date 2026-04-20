# ─────────────────────────────────────────────
#  Pattern & Plagiarism Detector — Makefile
# ─────────────────────────────────────────────

CXX = g++
CXXFLAGS = mingw32-make-std=c++17 -O2 -Wall -Wextra -Iinclude
TARGET   = detector
SRCDIR   = src
SRCS     = $(SRCDIR)/detector.cpp     \
           $(SRCDIR)/rabin_karp.cpp   \
           $(SRCDIR)/kmp.cpp          \
           $(SRCDIR)/boyer_moore.cpp  \
           $(SRCDIR)/json_output.cpp

# Windows vs Unix binary name
ifeq ($(OS), Windows_NT)
    TARGET_EXE = $(TARGET).exe
else
    TARGET_EXE = $(TARGET)
endif

.PHONY: all clean test

all: $(TARGET_EXE)

$(TARGET_EXE): $(SRCS)
	$(CXX) $(CXXFLAGS) -o $@ $^
	@echo "✅ Build successful → $(TARGET_EXE)"

clean:
	rm -f $(TARGET_EXE)
	@echo "🧹 Cleaned."

# Quick CLI test
test: $(TARGET_EXE)
	@echo "--- Test 1: simple pattern ---"
	./$(TARGET_EXE) "the cat sat on the mat and the cat came back" "cat"
	@echo ""
	@echo "--- Test 2: no match ---"
	./$(TARGET_EXE) "hello world" "xyz"
	@echo ""
	@echo "--- Test 3: file mode ---"
	./$(TARGET_EXE) samples/sample1.txt "the" --file