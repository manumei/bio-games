# Auxiliary Functions
import os
import sys
from PIL import Image

def squeeze_image_to_square(root_dir, relative_path):
    full_path = os.path.join(root_dir, relative_path)
    img = Image.open(full_path)
    size = max(img.size)
    img = img.resize((size, size), Image.LANCZOS)
    img.save(full_path)

