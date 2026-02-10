import xml.etree.ElementTree as ET
import base64
import os

xml_file = r'd:\tech\QUOTATION PAGE.xml'
output_image = r'd:\tech\quotation_header.png'

try:
    tree = ET.parse(xml_file)
    root = tree.getroot()

    # The namespace for pkg is usually http://schemas.microsoft.com/office/2006/xmlPackage
    namespaces = {'pkg': 'http://schemas.microsoft.com/office/2006/xmlPackage'}

    # Find the part for image1.png
    image_part = root.find(".//pkg:part[@pkg:name='/word/media/image1.png']", namespaces)
    
    if image_part is not None:
        binary_data_element = image_part.find('pkg:binaryData', namespaces)
        if binary_data_element is not None and binary_data_element.text:
            base64_data = binary_data_element.text
            image_data = base64.b64decode(base64_data)
            
            with open(output_image, 'wb') as f:
                f.write(image_data)
            print(f"Successfully extracted {output_image}")
        else:
            print("Found part but no binary data.")
    else:
        print("Could not find image part in XML.")

except Exception as e:
    print(f"Error: {e}")
