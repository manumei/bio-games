import os
import sys
import img_utils as iu

# Root
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
img_root = os.path.join(root_dir, "public", "assets", "img")

# Covers
covers_root = os.path.join(img_root, "covers")
covers_home = os.path.join(covers_root, "home")
covers_menu = os.path.join(covers_root, "menu")

# Games
taxo_home = os.path.join(covers_home, "taxo.png")
taxo_menu = os.path.join(covers_menu, "taxo.png")
wordle_home = os.path.join(covers_home, "wordle.png")
wordle_menu = os.path.join(covers_menu, "wordle.png")
link_home = os.path.join(covers_home, "link.png")
link_menu = os.path.join(covers_menu, "link.png")
tictac_home = os.path.join(covers_home, "tictac.png")
tictac_menu = os.path.join(covers_menu, "tictac.png")

# Squeezing
iu.squeeze_image_to_square(img_root, taxo_home)
# iu.squeeze_image_to_square(img_root, taxo_menu)