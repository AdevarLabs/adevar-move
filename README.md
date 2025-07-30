# Adevar Move

A CLI tool to scope Move projects for auditing by counting lines of code, excluding comments, blank lines, and test macros.

## Features

- 🔍 Recursively scans directories for `.move` files
- 📊 Counts lines of code excluding:
  - Single-line comments (`//`)
  - Block comments (`/* */`)
  - Blank lines and whitespace-only lines
  - Test code within `#[test]` and `#[test_only]` macros
- 📋 Outputs a formatted table with individual file stats and totals
- 🎯 Perfect for audit scoping and project analysis

## Installation

### Global Installation (Recommended)

```bash
npm install -g adevar-move
```

### Local Installation

```bash
npm install adevar-move
```

## Usage

### Command Line

```bash
# Analyze current directory
adevar-move

# Analyze specific directory
adevar-move /path/to/move/project

# Examples
adevar-move ./contracts
adevar-move ../my-move-project
```

### Programmatic Usage

```javascript
const { analyzeProject } = require('adevar-move');

const result = analyzeProject('/path/to/move/project');
console.log(`Total LOC: ${result.totalLOC}`);
console.log(`Files: ${result.totalFiles}`);
```

## Output Example

```
📊 Move Project Audit Scope Analysis

┌─────────────────────────────────────────────────────────────────────┬─────────────┐
│ File                                                                    │ Lines of Code │
├─────────────────────────────────────────────────────────────────────┼─────────────┤
│ sources/token.move                                                    │         150 │
│ sources/marketplace.move                                              │         200 │
│ sources/governance/voting.move                                        │         120 │
├─────────────────────────────────────────────────────────────────────┼─────────────┤
│ TOTAL                                                                 │         470 │
└─────────────────────────────────────────────────────────────────────┴─────────────┘

Summary: 3 files, 470 total lines of code
```

## What Gets Excluded

### Comments
```move
// This single-line comment is excluded
/* This block comment 
   is also excluded */
module example {
    // This is excluded
    public fun valid_code() { } // This line counts as 1 LOC
}
```

### Test Macros
```move
#[test]
fun test_function() {
    // This entire function is excluded from LOC count
    assert!(true, 0);
}

#[test_only]
module test_helpers {
    // This entire module is excluded
}
```

### Blank Lines
```move
module example {

    // Empty lines above and below are excluded

    public fun function() { } // This counts as 1 LOC
}
```

## Requirements

- Node.js >= 14.0.0
- Works on Windows, macOS, and Linux

## Development

```bash
# Clone the repository
git clone https://github.com/0xnirlin/adevar-move.git
cd adevar-move

# Install dependencies
npm install

# Run locally
node index.js /path/to/test/project
```

## License

MIT

## Contributing

Pull requests are welcome! Please feel free to submit issues and enhancement requests.

## Changelog

### 1.0.0
- Initial release
- Basic Move file scanning and LOC counting
- Comment and test macro exclusion
- Formatted table output