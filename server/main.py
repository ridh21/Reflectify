import os
import openpyxl #type: ignore
import pandas as pd #type: ignore
from flask_cors import CORS #type: ignore
from werkzeug.utils import secure_filename ##type: ignore
from flask import Flask, request, jsonify, make_response #type: ignore

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Faculty Matrix Processing Functions
def process_faculty_data(file_path):
    def process_sheet(wb, sheet_name):
        sheet = wb[sheet_name]
        merged_ranges = sheet.merged_cells.ranges
        
        new_wb = openpyxl.Workbook()
        new_sheet = new_wb.active
        
        # Copy data
        for row in sheet.rows:
            for cell in row:
                new_sheet.cell(row=cell.row, column=cell.column, value=cell.value)
        
        # Process merged cells
        for merged_range in merged_ranges:
            value = sheet.cell(merged_range.min_row, merged_range.min_col).value
            for row in range(merged_range.min_row, merged_range.max_row + 1):
                for col in range(merged_range.min_col, merged_range.max_col + 1):
                    new_sheet.cell(row=row, column=col, value=value)
        
        df = pd.DataFrame(new_sheet.values)
        df.columns = df.iloc[1]
        df = df.iloc[2:]
        df = df.reset_index(drop=True)
        
        return df
    
    def create_faculty_schedule_dict(processed_df):
        faculty_master = {}
        faculty_names = [col for col in processed_df.columns[2:] if pd.notna(col) and not str(col).isdigit()]
        
        for faculty in faculty_names:
            if faculty not in ['L1', 'L2']:
                faculty_master[faculty] = {
                    'Monday': [], 'Tuesday': [], 'Wednesday': [],
                    'Thursday': [], 'Friday': [], 'Saturday': []
                }
        
        day_mapping = {
            'MON': 'Monday', 'MONDAY': 'Monday',
            'TUES': 'Tuesday', 'TUESDAY': 'Tuesday',
            'WED': 'Wednesday', 'WEDNESDAY': 'Wednesday',
            'THUR': 'Thursday', 'THURSDAY': 'Thursday',
            'FRI': 'Friday', 'FRIDAY': 'Friday',
            'SAT': 'Saturday', 'SATURDAY': 'Saturday'
        }
        
        processed_labs = set()
        
        # Process regular faculty columns
        for faculty in faculty_names:
            if faculty in ['L1', 'L2']:
                continue
                
            faculty_column = processed_df[faculty]
            
            for row_idx in range(len(faculty_column)):
                cell_value = faculty_column.iloc[row_idx]
                day_value = str(processed_df.iloc[row_idx, 0]).strip().upper()
                time_slot = processed_df.iloc[row_idx, 1]
                day = day_mapping.get(day_value)
                
                if pd.notna(cell_value) and cell_value != '' and day is not None:
                    is_lab = False
                    if row_idx > 0 and faculty_column.iloc[row_idx-1] == cell_value:
                        is_lab = True
                        lab_key = f"{faculty}_{day}_{cell_value}_{row_idx-1}"
                        if lab_key in processed_labs:
                            continue
                        processed_labs.add(lab_key)
                    elif row_idx < len(faculty_column)-1 and faculty_column.iloc[row_idx+1] == cell_value:
                        is_lab = True
                        lab_key = f"{faculty}_{day}_{cell_value}_{row_idx}"
                        if lab_key in processed_labs:
                            continue
                        processed_labs.add(lab_key)
                    
                    schedule_entry = {
                        'subject': cell_value,
                        'type': 'Lab' if is_lab else 'Lecture',
                        'time_slot': int(time_slot)
                    }
                    
                    faculty_master[faculty][day].append(schedule_entry)
        
        # Process L1 and L2 columns
        for misc_col in ['L1', 'L2']:
            if misc_col in processed_df.columns:
                misc_column = processed_df[misc_col]
                
                for row_idx in range(len(misc_column)):
                    entry = misc_column.iloc[row_idx]
                    if pd.notna(entry) and isinstance(entry, str) and '(' in entry and ')' in entry:
                        subject = entry[:entry.find('(')].strip()
                        faculty = entry[entry.find('(')+1:entry.find(')')].strip()
                        
                        day_value = str(processed_df.iloc[row_idx, 0]).strip().upper()
                        time_slot = processed_df.iloc[row_idx, 1]
                        day = day_mapping.get(day_value)
                        
                        if day:
                            if faculty not in faculty_master:
                                faculty_master[faculty] = {
                                    'Monday': [], 'Tuesday': [], 'Wednesday': [],
                                    'Thursday': [], 'Friday': [], 'Saturday': []
                                }
                            
                            schedule_entry = {
                                'subject': subject,
                                'type': 'Lab' if subject[-1].isdigit() else 'Lecture',
                                'time_slot': int(time_slot)
                            }
                            
                            faculty_master[faculty][day].append(schedule_entry)
        
        return faculty_master
    
    # Main execution
    wb = openpyxl.load_workbook(file_path)
    all_faculty_schedules = {}
    
    for sheet_name in wb.sheetnames:
        processed_df = process_sheet(wb, sheet_name)
        sheet_schedules = create_faculty_schedule_dict(processed_df)
        
        # Merge schedules from different sheets
        for faculty, schedule in sheet_schedules.items():
            if faculty not in all_faculty_schedules:
                all_faculty_schedules[faculty] = schedule
            else:
                for day in schedule:
                    all_faculty_schedules[faculty][day].extend(schedule[day])
    
    return all_faculty_schedules

def extract_division(class_info):
    divisions = []
    parts = class_info.split('/')
    for part in parts:
        div = ''.join(char for char in part if not char.isdigit())
        divisions.append(div)
    return divisions

def parse_subject_string(subject_str):
    if not subject_str or not isinstance(subject_str, str) or 'TUT' in subject_str:
        return None
        
    parts = subject_str.strip().split()
    if len(parts) < 2:
        return None
        
    subject_code = parts[0]
    class_info = parts[1]
    
    # Extract semester
    semester_digits = ''.join(filter(str.isdigit, class_info[:2]))
    if not semester_digits:
        return None
    semester = int(semester_digits[0])
    
    # Process divisions and batch
    divisions = []
    batch = None
    
    if 'ALL' in class_info:
        divisions = ['ALL']
    else:
        division_parts = class_info[1:].split('/')  # Skip semester number
        
        for part in division_parts:
            # Extract division letter
            div = ''.join(char for char in part if char.isalpha()).upper()
            
            # Extract batch including asterisk if present
            batch_part = ''.join(char for char in part if char.isdigit() or char == '*')
            if batch_part:
                batch = batch_part
                
            divisions.append(div)
    
    return {
        'subject_code': subject_code,
        'semester': semester,
        'divisions': divisions,
        'batch': batch,
        'is_lab': batch is not None
    }

def create_division_tables(faculty_schedules):
    division_tables = {}
    semester_divisions = {}
    
    # First pass: collect all divisions
    for faculty_name, faculty_schedule in faculty_schedules.items():
        for day, sessions in faculty_schedule.items():
            for session in sessions:
                parsed = parse_subject_string(session['subject'])
                if parsed:
                    sem = parsed['semester']
                    if sem not in semester_divisions:
                        semester_divisions[sem] = set()
                    if 'ALL' not in parsed['divisions']:
                        for div in parsed['divisions']:
                            semester_divisions[sem].add(div)
    
    # Second pass: populate tables
    for faculty_name, faculty_schedule in faculty_schedules.items():
        for day, sessions in faculty_schedule.items():
            for session in sessions:
                parsed = parse_subject_string(session['subject'])
                if parsed:
                    sem = parsed['semester']
                    target_divisions = []
                    
                    if 'ALL' in parsed['divisions']:
                        target_divisions = list(semester_divisions[sem])
                    else:
                        target_divisions = parsed['divisions']
                    
                    for div in target_divisions:
                        key = f"{sem}{div}"
                        if key not in division_tables:
                            division_tables[key] = []
                        
                        entry = {
                            'Subject': parsed['subject_code'],
                            'Type': 'Lab' if parsed['is_lab'] else 'Lecture',
                            'Batch': parsed['batch'] if parsed['is_lab'] else '-',
                            'Day': day,
                            'Time_Slot': session['time_slot'],
                            'Faculty': faculty_name
                        }
                        
                        division_tables[key].append(entry)
                        
                        if parsed['is_lab']:
                            next_slot_entry = entry.copy()
                            next_slot_entry['Time_Slot'] = session['time_slot'] + 1
                            division_tables[key].append(next_slot_entry)
    
    # Convert to DataFrames
    for key in division_tables:
        df = pd.DataFrame(division_tables[key])
        df = combine_lab_sessions(df)
        division_tables[key] = df
    
    return division_tables

def combine_lab_sessions(df):
    """Combine consecutive lab sessions into single entries"""
    combined_entries = []
    skip_next = False
    
    for i in range(len(df)):
        if skip_next:
            skip_next = False
            continue
            
        current_row = df.iloc[i]
        
        # If this is a lab and there's a next row
        if i < len(df)-1 and current_row['Type'] == 'Lab':
            next_row = df.iloc[i+1]
            
            # If next row is same lab session
            if (next_row['Type'] == 'Lab' and 
                next_row['Subject'] == current_row['Subject'] and
                next_row['Batch'] == current_row['Batch'] and
                next_row['Faculty'] == current_row['Faculty'] and
                next_row['Time_Slot'] == current_row['Time_Slot'] + 1):
                
                # Combine into single entry
                entry = current_row.to_dict()
                entry['Time_Slot'] = f"{current_row['Time_Slot']}-{next_row['Time_Slot']}"
                combined_entries.append(entry)
                skip_next = True
            else:
                combined_entries.append(current_row.to_dict())
        else:
            combined_entries.append(current_row.to_dict())
    
    new_df = pd.DataFrame(combined_entries)
    return new_df.sort_values(['Day', 'Time_Slot', 'Batch']).reset_index(drop=True)

def create_condensed_tables(division_tables):
    condensed_tables = {}
    
    for div_key, df in division_tables.items():
        # Drop time-related columns
        condensed_df = df.drop(['Time_Slot', 'Day'], axis=1)
        
        # Remove duplicate entries while preserving unique combinations
        condensed_df = condensed_df.drop_duplicates()
        
        # Sort by Subject and Batch for better readability
        condensed_df = condensed_df.sort_values(['Subject', 'Batch']).reset_index(drop=True)
        
        condensed_tables[div_key] = condensed_df
    
    return condensed_tables

def create_final_dictionary(condensed_division_tables, college="LDRP-ITR", department="CE"):
    final_dictionary = {
        college: {
            department: {}
        }
    }
    
    # Group by semesters
    for div_key, df in condensed_division_tables.items():
        semester = div_key[0]  # First character is semester number
        division = div_key[1:] # Rest is division name
        
        # Initialize semester if not exists
        if semester not in final_dictionary["LDRP-ITR"]["CE"]:
            final_dictionary["LDRP-ITR"]["CE"][semester] = {}
            
        # Initialize division
        if division not in final_dictionary["LDRP-ITR"]["CE"][semester]:
            final_dictionary["LDRP-ITR"]["CE"][semester][division] = {}
            
        # Process each subject
        for subject in df['Subject'].unique():
            subject_data = df[df['Subject'] == subject]
            
            subject_dict = {
                'lectures': {},
                'labs': {}
            }
            
            # Process lectures
            lectures = subject_data[subject_data['Type'] == 'Lecture']
            if not lectures.empty:
                subject_dict['lectures'] = {
                    'designated_faculty': lectures['Faculty'].iloc[0]
                }
            
            # Process labs
            labs = subject_data[subject_data['Type'] == 'Lab']
            if not labs.empty:
                subject_dict['labs'] = {
                    batch: {'designated_faculty': faculty}
                    for batch, faculty in zip(labs['Batch'], labs['Faculty'])
                }
            
            final_dictionary["LDRP-ITR"]["CE"][semester][division][subject] = subject_dict
            
    return final_dictionary

def final_func(matrix_file, college="LDRP-ITR", department="CE"):
    faculty_schedules = process_faculty_data(matrix_file)

    division_tables = create_division_tables(faculty_schedules)

    condensed_division_tables = create_condensed_tables(division_tables)
    
    final_dict = create_final_dictionary(condensed_division_tables, college=college, department=department)
    
    return final_dict

# Upload Functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route Functions
@app.route('/faculty-matrix', methods=['POST'])
def upload_faculty_matrix():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")

    if 'facultyMatrix' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
        
    file = request.files['facultyMatrix']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'faculty_matrix.xlsx')
        file.save(filepath)
        results = final_func(filepath, college="LDRP-ITR", department="CE")
        return jsonify(results)
    
    return jsonify({'message': 'Invalid file format'}), 400

@app.route('/student-data/', methods=['POST'])
def upload_student_data():
    if 'studentData' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
        
    file = request.files['studentData']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'student_data.xlsx')
        file.save(filepath)
        return jsonify({'message': 'Student data file uploaded successfully'})
    
    return jsonify({'message': 'Invalid file format'}), 400

@app.route('/faculty-data/', methods=['POST'])
def upload_faculty_data():
    if 'facultyData' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
        
    file = request.files['facultyData']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'faculty_data.xlsx')
        file.save(filepath)
        return jsonify({'message': 'Faculty data file uploaded successfully'})
    
    return jsonify({'message': 'Invalid file format'}), 400

@app.route('/subject-data/', methods=['POST'])
def upload_subject_data():
    if 'subjectData' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
        
    file = request.files['subjectData']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'subject_data.xlsx')
        file.save(filepath)
        return jsonify({'message': 'Subject data file uploaded successfully'})
    
    return jsonify({'message': 'Invalid file format'}), 400

if __name__ == '__main__':
    app.run(port=8000, debug=True)