import os
import csv

# === Root Directory ===
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# === Paths Taxo ===
webp_root_taxo = os.path.join(root_dir, "public", "assets", "webp", "games", "taxo")
data_path = os.path.join(root_dir, "public", "assets", "data")

def taxonomicTranscriberCSV(root_dir, data_path, webp_root_path):
    '''
    Creates taxonomy.csv with rows: Organism Name, Taxonomy Path, Relative WebP Path
    '''
    output_file = os.path.join(data_path, "taxonomy.csv")
    os.makedirs(data_path, exist_ok=True)

    with open(output_file, "w", encoding="utf-8", newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["Organism Name", "Taxonomic Categories", "Image Path"])  # Header

        for dirpath, dirnames, filenames in os.walk(webp_root_path):
            if not dirnames and filenames:
                taxonomy_path = os.path.relpath(dirpath, webp_root_path).split(os.sep)

                for file in filenames:
                    if file.lower().endswith(".webp"):
                        base_name = os.path.splitext(file)[0]
                        formatted_name = base_name.replace("_", " ").title()
                        rel_webp_path = os.path.relpath(os.path.join(dirpath, file), root_dir).replace("\\", "/")

                        writer.writerow([formatted_name, "; ".join(taxonomy_path), rel_webp_path])

    print(f"✅ Taxonomy transcription complete! Written to: {output_file}")

def clear_taxonomy_csv(data_path):
    '''
    Clears the contents of taxonomy.csv.
    '''
    taxonomy_file = os.path.join(data_path, "taxonomy.csv")
    os.makedirs(data_path, exist_ok=True)

    with open(taxonomy_file, "w", encoding="utf-8", newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Organism Name", "Taxonomic Categories", "Image Path"])  # Keep header

    print(f"🧹 taxonomy.csv has been cleared at: {taxonomy_file}")

# Call the functions
taxonomicTranscriberCSV(root_dir, data_path, webp_root_taxo)
# clear_taxonomy_csv(data_path)