import os
import glob
import subprocess

# Set the directory path where the scripts are located
directory_path = '../DBScripts'

# Get a list of all the Python files in the directory
python_files = glob.glob(os.path.join(directory_path, '[!_]*.py'))

# Run each Python script using subprocess
for file in python_files:
    subprocess.run(['python', file])
