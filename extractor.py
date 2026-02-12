import os
import zipfile
from datetime import datetime, timezone

def main():
    # Assigning filename to a variable
    zip_file_name = 'racalculator.zip'
    destination_directory = '.'  # Represents the current directory relative to the script

    # Opening Zip using 'with' keyword in read mode
    with zipfile.ZipFile(zip_file_name, 'r') as zip_file:
        # Extracting all files from the zip archive
        print('Extracting all files...')
        zip_file.extractall(destination_directory)
        print('Extraction done!')

        # Iterate over each file in the zip archive
        for file_info in zip_file.infolist():
            extracted_file_path = os.path.join(destination_directory, file_info.filename)
            # Check if the extracted file exists
            if os.path.exists(extracted_file_path):
                # Convert the zip file's date_time tuple to a datetime object
                zip_file_date = datetime(*file_info.date_time, tzinfo=timezone.utc)
                # Get the modification time of the extracted file
                extracted_file_mtime = datetime.fromtimestamp(os.path.getmtime(extracted_file_path), tz=timezone.utc)
                # Compare the modification times to decide if the file should be overwritten
                if extracted_file_mtime < zip_file_date:
                    print(f'Overwriting {file_info.filename} with a newer version...')
                    zip_file.extract(file_info, destination_directory)
                    print('File overwritten.')
                else:
                    print(f'{file_info.filename} is up to date. No need to overwrite.')
            else:
                # This block will execute if the file doesn't exist, which is unlikely given the extractall() method call above
                print(f'File {file_info.filename} not found in the destination directory.')

if __name__ == '__main__':
    main()
