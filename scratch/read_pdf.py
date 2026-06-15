import sys

try:
    import pypdf
    def extract_text(pdf_path):
        with open(pdf_path, 'rb') as f:
            reader = pypdf.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
except ImportError:
    try:
        from PyPDF2 import PdfReader
        def extract_text(pdf_path):
            with open(pdf_path, 'rb') as f:
                reader = PdfReader(f)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
    except ImportError:
        def extract_text(pdf_path):
            return "Error: Neither pypdf nor PyPDF2 is installed."

if __name__ == "__main__":
    path = "/Users/zhoulin/Desktop/AMC物料/数学竞赛班 （成都地区）.pdf"
    print(extract_text(path))
