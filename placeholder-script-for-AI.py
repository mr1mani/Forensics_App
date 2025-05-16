import sys
import os

def process_file(file_path):
    # Your analysis logic here
    file_size = os.path.getsize(file_path)
    return f"""
    File analyzed: {os.path.basename(file_path)}
    Size: {file_size} bytes
    Analysis: Sample forensic data
    """

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <file_path>")
        sys.exit(1)
        
    print(process_file(sys.argv[1]))