import re

html_file = "DONOTREMOVE.html"

with open(html_file, 'r') as file:
    html_content = file.read()

index = 0
product_regex = re.compile(r'<div class="product">(.*?)</div>', re.DOTALL)
name_regex = re.compile(r'<h3>(.*?)</h3>')
type_regex = re.compile(r'<p class="type">(.*?)</p>')
price_regex = re.compile(r'<p>\$(.*?)</p>')
description_regex = re.compile(r'<p class="description">(.*?)</p>')
image_regex = re.compile(r'<img src="assets/images/(.*?)"')
products = product_regex.findall(html_content)

print("id|name|category|price|description|image")

for product in products:
    name = re.search(name_regex, product).group(1) if re.search(name_regex, product) else 'N/A'
    type_ = re.search(type_regex, product).group(1).lower() if re.search(type_regex, product) else 'N/A'
    price = re.search(price_regex, product).group(1) if re.search(price_regex, product) else 'N/A'
    description = re.search(description_regex, product).group(1) if re.search(description_regex, product) else 'N/A'
    image = re.search(image_regex, product).group(1) if re.search(image_regex, product) else 'N/A'
    index += 1
    print(f"{index}|{name}|{type_}|{price}|{description}|{image}")
