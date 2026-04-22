import sys
try:
    from Quartz import PDFDocument
    from Foundation import NSURL
    
    url = NSURL.fileURLWithPath_(sys.argv[1])
    doc = PDFDocument.alloc().initWithURL_(url)
    if doc:
        print(doc.string())
    else:
        print("Could not parse PDF")
except Exception as e:
    print(f"Error: {e}")
