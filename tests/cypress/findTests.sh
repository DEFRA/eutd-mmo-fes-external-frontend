#!/bin/bash

# Directory to start searching from (passed as argument)
start_dir="$1"

# Number of equal batches to create (passed as argument)
num_lists="$2"

# Validate arguments
if [ -z "$start_dir" ] || [ -z "$num_lists" ]; then
  echo "Error: Missing required arguments" >&2
  echo "Usage: $0 <directory> <number_of_batches>" >&2
  exit 1
fi

if ! [[ "$num_lists" =~ ^[0-9]+$ ]] || [ "$num_lists" -lt 1 ]; then
  echo "Error: Number of batches must be a positive integer" >&2
  exit 1
fi

# Associative array to store file paths with their test case counts
declare -A file_test_counts

# Function to count test cases in a file
count_test_cases() {
  local file="$1"
  # Count occurrences of it( and it.only( patterns
  local count=$(grep -oE '\bit\s*\(' "$file" | wc -l)
  local count_only=$(grep -oE '\bit\.only\s*\(' "$file" | wc -l)
  echo $((count + count_only))
}

# Function to recursively find all files and count their test cases
find_files_with_counts() {
  local dir="$1"
  echo "=== Scanning files for test cases ===" >&2
  while IFS= read -r -d '' file; do
    local test_count=$(count_test_cases "$file")
    file_test_counts["$file"]=$test_count
    echo "  $(basename "$file"): $test_count test(s)" >&2
  done < <(find "$dir" -type f -name "*.spec.ts" -print0 | sort)
  echo "" >&2
}
# Call the function with the starting directory
find_files_with_counts "$start_dir"

# Check if any files were found
if [ ${#file_test_counts[@]} -eq 0 ]; then
  echo "Error: No .spec.ts files found in $start_dir" >&2
  exit 1
fi

# Adjust num_lists if more batches than files
total_files=${#file_test_counts[@]}
if [ "$num_lists" -gt "$total_files" ]; then
  echo "Warning: Requested $num_lists batches but only $total_files files found. Adjusting to $total_files batches." >&2
  num_lists=$total_files
fi

# Sort files by test count (descending) for better load balancing
# Store in array: file_path:test_count
sorted_files=()
while IFS= read -r line; do
  sorted_files+=("$line")
done < <(
  for file in "${!file_test_counts[@]}"; do
    echo "$file:${file_test_counts[$file]}"
  done | sort -t: -k2 -rn
)

# Initialize batches with empty arrays and counters
declare -a batches
declare -a batch_counts
for ((i = 0; i < num_lists; i++)); do
  batches[$i]=""
  batch_counts[$i]=0
done

# Greedy algorithm: assign each file to the batch with the smallest current count
# This provides best-fit approximation for load balancing
for entry in "${sorted_files[@]}"; do
  IFS=: read -r file count <<< "$entry"
  
  # Skip files with no test cases (edge case)
  if [ "$count" -eq 0 ]; then
    continue
  fi
  
  # Find batch with minimum test count
  min_batch=0
  min_count=${batch_counts[0]}
  for ((i = 1; i < num_lists; i++)); do
    if ((batch_counts[i] < min_count)); then
      min_count=${batch_counts[i]}
      min_batch=$i
    fi
  done
  
  # Add file to the batch with minimum count
  if [ -z "${batches[$min_batch]}" ]; then
    batches[$min_batch]="$file"
  else
    batches[$min_batch]="${batches[$min_batch]},$file"
  fi
  batch_counts[$min_batch]=$((batch_counts[$min_batch] + count))
done

# Print debug information about batches
echo "=== Batch Distribution Summary ===" >&2
total_tests=0
for ((i = 0; i < num_lists; i++)); do
  if [ -n "${batches[i]}" ]; then
    echo "" >&2
    echo "Batch $((i + 1)): ${batch_counts[i]} test cases" >&2
    IFS=',' read -ra files <<< "${batches[i]}"
    for file in "${files[@]}"; do
      test_count=${file_test_counts["$file"]}
      echo "  - $(basename "$file"): $test_count test(s)" >&2
    done
    total_tests=$((total_tests + batch_counts[i]))
  fi
done
echo "" >&2
echo "Total test cases across all batches: $total_tests" >&2
echo "Average per batch: $((total_tests / num_lists))" >&2
echo "================================" >&2
echo "" >&2

# Print the comma-separated batches (stdout for actual usage)
for ((i = 0; i < num_lists; i++)); do
  # Only print non-empty batches
  if [ -n "${batches[i]}" ]; then
    echo "${batches[i]}"
  fi
done