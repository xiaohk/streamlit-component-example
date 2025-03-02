from pathlib import Path

import setuptools

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

# Read the version from package.json and set it in the setup configuration

setuptools.setup(
    version="0.0.1",
)
