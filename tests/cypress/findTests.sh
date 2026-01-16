#!/bin/bash

# Directory to start searching from (passed as argument)
start_dir="$1"

# Number of equal lists to create (passed as argument)
num_lists="$2"

# Validate arguments
if [[ -z "$start_dir" ]] || [[ -z "$num_lists" ]]; then
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
  local count
  local count_only
  count=$(grep -oE '\bit\s*\(' "$file" 2>/dev/null | wc -l | tr -d ' ')
  count_only=$(grep -oE '\bit\.only\s*\(' "$file" 2>/dev/null | wc -l | tr -d ' ')
  echo "$((count + count_only))"
  return 0
}

# Function to recursively find all files and count their test cases
find_files_with_counts() {
  local dir="$1"
  local file
  while IFS= read -r -d '' file; do
    files+=("$file")
  done < <(find "$dir" -type f -print0 | sort)
}

# Call the function with the starting directory
find_files_with_counts "$start_dir"

# Check if any files were found
if [[ ${#file_test_counts[@]} -eq 0 ]]; then
  echo "Error: No .spec.ts files found in $start_dir" >&2
  exit 1
fi

# Adjust num_lists if more batches than files
total_files=${#file_test_counts[@]}
if [[ "$num_lists" -gt "$total_files" ]]; then
  echo "Warning: Requested $num_lists batches but only $total_files files found. Adjusting to $total_files batches." >&2
  num_lists=$total_files
fi

# Sort files by test count (descending) for better load balancing
# Store in array: file_path:test_count
sorted_files=()
while IFS= read -r line; do
  [ -n "$line" ] && sorted_files+=("$line")
done < <(
  for file in "${!file_test_counts[@]}"; do
    printf '%s:%s\n' "$file" "${file_test_counts[$file]}"
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
  if [[ "${count:-0}" -eq 0 ]]; then
    continue
  fi
  start_index=$((i * files_per_list + ((i < remainder) ? i : remainder)))
  list=$(printf "%s," "${files[@]:$start_index:$((files_per_list+offset))}")
  list=${list%,} # Remove trailing comma from list
  lists+=("$list")
done

# Print debug information about batches
echo "=== Batch Distribution Summary ===" >&2
total_tests=0
for ((i = 0; i < num_lists; i++)); do
  echo "${lists[i]}"
done
echo "" >&2
echo "Total test cases across all batches: $total_tests" >&2
echo "Average per batch: $((total_tests / num_lists))" >&2
echo "================================" >&2
echo "" >&2

# Print the comma-separated batches (stdout for actual usage)
for ((i = 0; i < num_lists; i++)); do
  # Only print non-empty batches
  if [[ -n "${batches[i]}" ]]; then
    echo "${batches[i]}"
  fi
done