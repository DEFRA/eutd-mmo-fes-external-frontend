#!/bin/bash

# Directory to start searching from (passed as argument)
start_dir="$1"

# Number of equal lists to create (passed as argument)
num_lists="$2"

# Array to store all file paths
files=()

# Function to recursively find all files in a directory and its subdirectories
find_files() {
  local dir="$1"
  local file
  while IFS= read -r -d '' file; do
    files+=("$file")
  done < <(find "$dir" -type f -print0 | sort)
}

# Call the function with the starting directory
find_files "$start_dir"

# Get the total number of files
total_files=${#files[@]}

# Calculate the number of files in each list
files_per_list=$((total_files / num_lists))
remainder=$((total_files % num_lists))

# Divide the files into the specified number of equal lists
lists=()
for ((i = 0; i < num_lists; i++)); do
  offset=0
  if (( i < remainder )); then
    offset=1
  fi
  start_index=$((i * files_per_list + ((i < remainder) ? i : remainder)))
  list=$(printf "%s," "${files[@]:$start_index:$((files_per_list+offset))}")
  list=${list%,} # Remove trailing comma from list
  lists+=("$list")
done

# Print the comma-separated lists
for ((i = 0; i < num_lists; i++)); do
  echo "${lists[i]}"
done
