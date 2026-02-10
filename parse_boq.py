import xml.etree.ElementTree as ET
import html

def xml_to_html_template(xml_file, output_html_file):
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

        table = root.find('.//w:tbl', namespaces)
        
        if table is None:
            print("No table found in XML.")
            return

        rows = table.findall('.//w:tr', namespaces)
        data_rows = rows[1:] 

        html_rows = ""
        for tr in data_rows:
            cells = tr.findall('.//w:tc', namespaces)
            if not cells:
                continue
            row_html = "<tr>"
            
            def get_cell_text(cell):
                texts = cell.findall('.//w:t', namespaces)
                return "".join([t.text for t in texts if t.text])

            sr_no = get_cell_text(cells[0]) if len(cells) > 0 else ""
            item = get_cell_text(cells[1]) if len(cells) > 1 else ""
            make = get_cell_text(cells[2]) if len(cells) > 2 else ""
            narration = get_cell_text(cells[3]) if len(cells) > 3 else ""
            qty = get_cell_text(cells[4]) if len(cells) > 4 else ""
            unit = get_cell_text(cells[5]) if len(cells) > 5 else ""

            # Use simple border styling for all cells
            # Use simple border styling for all cells
            td_style = 'border: 1px solid black; padding: 4px;'
            
            # Columns are static again (reverted contenteditable)
            # Added IDs for JS targeting: boq_{field}_{sr_no}
            # Sr No is 01, 02 etc.
            
            row_html += f'<td style="{td_style}">{html.escape(sr_no)}</td>'
            row_html += f'<td id="boq_item_{sr_no}" style="{td_style}">{html.escape(item)}</td>'
            row_html += f'<td id="boq_make_{sr_no}" style="{td_style}">{html.escape(make)}</td>'
            row_html += f'<td id="boq_narration_{sr_no}" style="{td_style}">{html.escape(narration)}</td>'
            row_html += f'<td id="boq_qty_{sr_no}" style="{td_style}">{html.escape(qty)}</td>'
            row_html += f'<td id="boq_unit_{sr_no}" style="{td_style}">{html.escape(unit)}</td>'
            row_html += "</tr>"
            html_rows += row_html + "\n"

        # Update HTML structure to match requested design
        full_html = f"""
                        <!-- BOQ Page (Page 2/3) - GENERATED FROM XML -->
                        <div id="boqPage" class="quotation-page A4" style="padding: 15mm;">
                            
                        <!-- Header -->
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                                <div style="width: 35%;">
                                    <img src="boq_header.png" alt="TechRedo Solar" style="width: 100%; max-width: 180px;">
                                </div>
                                <div style="text-align: right; font-family: 'Berlin Sans FB', sans-serif; color: #666; font-size: 11pt; font-weight: bold; line-height: 1.2;">
                                    <p style="margin: 0;">enquiry@techredo.in</p>
                                    <p style="margin: 0;">+91 77 11 00 6999</p>
                                    <p style="margin: 0;">www.techredo.in</p>
                                </div>
                            </div>
                            
                            <!-- Separator Line -->
                            <hr style="border: 0; border-top: 1px solid #999; margin-bottom: 20px; margin-top: 5px;">

                            <!-- Title -->
                            <div style="text-align: center; margin-bottom: 5px;">
                                <h3 style="font-family: 'Times New Roman', serif; font-weight: bold; font-size: 12pt; text-transform: uppercase; margin: 0; padding: 5px;">BILL OF MATERIAL</h3>
                            </div>

                            <!-- Table -->
                            <table class="scope-table" style="width: 100%; border-collapse: collapse; font-size: 9pt; font-family: 'Times New Roman', serif; border: 1px solid black;">
                                <thead>
                                    <tr style="background-color: #EEECE1;">
                                        <th style="border: 1px solid black; padding: 4px; width: 40px; text-align: center;">SR NO.</th>
                                        <th style="border: 1px solid black; padding: 4px; text-align: left;">ITEM</th>
                                        <th style="border: 1px solid black; padding: 4px; text-align: left;">MAKE</th>
                                        <th style="border: 1px solid black; padding: 4px; text-align: left;">NARRATION</th>
                                        <th style="border: 1px solid black; padding: 4px; width: 60px; text-align: center;">QTY</th>
                                        <th style="border: 1px solid black; padding: 4px; width: 50px; text-align: center;">UNIT</th>
                                    </tr>
                                </thead>
                                <tbody>
{html_rows}
                                </tbody>
                            </table>
                            
                            <!-- Note -->
                            <p style="font-size: 8pt; font-weight: bold; margin-top: 15px; font-family: 'Times New Roman', serif;">*** THIS IS TENTATIVE BOM OF PROJECT, QUANTITY MAY VARY AS PER SITE CONDITIONS AND REQUIREMENTS.</p>

                            <!-- Footer Signature (Empty box placeholder if needed, or just space) -->
                            <div style="text-align: right; margin-top: 20px;">
                                <div style="display:inline-block; width: 30px; height: 30px; border: 1px solid #ccc;"></div>
                            </div>

                            <!-- Bottom Footer -->
                            <div style="position: absolute; bottom: 5mm; width: calc(100% - 30mm); text-align: center; font-family: 'Berlin Sans FB', sans-serif; color: #777; font-size: 10pt;">
                                <p style="margin: 0;">A solar division of <span style="font-family: 'Cooper Black', serif; color: #ff3333;">TechRedo</span> India Private Limited</p>
                            </div>
                        </div>
        """
        
        with open(output_html_file, "w", encoding="utf-8") as f:
            f.write(full_html)
            
        print(f"Successfully generated HTML fragment to {output_html_file}")

    except Exception as e:
        print(f"Error parsing XML: {e}")

if __name__ == "__main__":
    xml_to_html_template("BOQ.xml", "boq_section.html")
