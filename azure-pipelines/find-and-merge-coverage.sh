#!/bin/bash
set -e
set -o pipefail

# source directory (1st argument)
src_dir="$1"
# destination directory (2nd argument)
dest_dir="$2"

lsb_release -a

# checking if source and destination directories are provided
if [ -z "$src_dir" ] || [ -z "$dest_dir" ]; then
    echo "Error: Please provide both source and destination directories."
    exit 1
fi

# check if source directory exists
if [ ! -d "$src_dir" ]; then
    echo "Error: Source directory '$src_dir' does not exist."
    exit 1
fi

# check if destination directory exists, if not create it
if [ ! -d "$dest_dir" ]; then
    mkdir -p "$dest_dir"
    echo "Created directory '$dest_dir'"
fi

# loop over all coverage-final.json files in coverage_* directories
for src_file in $src_dir/coverage_*/coverage-final.json; do
    # check if file exists
    if [ ! -f "$src_file" ]; then
        echo "Warning: Source file '$src_file' does not exist. Skipping..."
        continue
    fi
    echo "Found '$src_file'.."

    # get the index from the directory name
    dir=$(dirname "$src_file")
    index="${dir##*_}"
    dest_file="$dest_dir"/coverage-final-"$index".json

    # copy and rename the json file
    cp "$src_file" "$dest_file"

    # check if copy operation was successful
    if [ $? -ne 0 ]; then
        echo "Error: Failed to copy '$src_file' to '$dest_file'"
        exit 1
    fi

    echo "Copied '$src_file' to '$dest_file'"
    # Replace file path
    sed -i 's|/app/app/|./app/|g' "$dest_file"

done

# Now merge all of the files

npx nyc report --reporter lcov --reporter html --reporter cobertura --reporter text --reporter text-summary -t $dest_dir/ --report-dir $dest_dir/summary
          
# lcov --summary --rc lcov_branch_coverage=1 $dest_dir/summary/lcov.info

echo "Script completed successfully."
