import os
import sys
from PIL import Image

def squeeze_image_to_square(root_dir, relative_path):
    full_path = os.path.join(root_dir, relative_path)
    img = Image.open(full_path)
    size = max(img.size)
    img = img.resize((size, size), Image.LANCZOS)
    img.save(full_path)

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
img_root = os.path.join(root_dir, "public", "assets", "img")
covers_root = os.path.join(img_root, "covers")
covers_home = os.path.join(covers_root, "home")
covers_menu = os.path.join(covers_root, "menu")

taxo_home = os.path.join(covers_home, "taxo.png")
taxo_menu = os.path.join(covers_menu, "taxo.png")
squeeze_image_to_square(img_root, taxo_home)
# squeeze_image_to_square(img_root, taxo_menu)