import xml.etree.ElementTree as ET

xml_file = r'd:\tech\BOQ.xml'
try:
    tree = ET.parse(xml_file)
    root = tree.getroot()
    namespaces = {'pkg': 'http://schemas.microsoft.com/office/2006/xmlPackage'}
    
    print("Listing parts in BOQ.xml:")
    for part in root.findall('.//pkg:part', namespaces):
        name = part.attrib.get('{http://schemas.microsoft.com/office/2006/xmlPackage}name')
        if 'media' in name:
            print(f"IMAGE: {name}")
        elif 'header' in name or 'footer' in name:
             print(f"DOC PART: {name}")
        
except Exception as e:
    print(f"Error: {e}")
