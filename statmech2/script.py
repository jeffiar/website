import os

template = """<!DOCTYPE HTML>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="0;url={0}" />
        <link rel="canonical" href="{0}" />
    </head>
    <body>
        <h1>
            The page been moved to <a href="{0}">{0}</a>
        </h1>
    </body>
</html>
"""

url_base = "https://stanford.edu/~jeffjar/statmech/"
filenames = [f for f in os.listdir("../statmech") if f.endswith(".html")]

for filename in filenames:
    with open(filename, 'w') as f:
        f.write(template.format(url_base + filename))
