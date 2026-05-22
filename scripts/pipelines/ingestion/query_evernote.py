import inspect
if not hasattr(inspect, "getargspec"):
    inspect.getargspec = inspect.getfullargspec

from evernote.api.client import EvernoteClient
import evernote.edam.notestore.NoteStore as NoteStore

dev_token = "S=s37:U=159e77f:E=19d6ffda9e2:C=19d4bf124a0:P=1cd:A=en-devtoken:V=2:H=4ed22390f3565292023967edb6ce05e4"
try:
    client = EvernoteClient(token=dev_token, sandbox=False, service_host='app.yinxiang.com')
    note_store = client.get_note_store()
    
    # Get all notebooks
    notebooks = note_store.listNotebooks()
    print("=== Yinxiang Notebooks ===")
    for nb in notebooks:
        print(f"- {nb.name}")

    # Create a filter to get recent notes
    filter = NoteStore.NoteFilter()
    
    # Get recent 20 notes metadata
    result_spec = NoteStore.NotesMetadataResultSpec(includeTitle=True, includeTagGuids=True, includeCreated=True)
    notes_meta = note_store.findNotesMetadata(dev_token, filter, 0, 20, result_spec)
    
    print("\n=== Recent Notes ===")
    for note in notes_meta.notes:
        print(f"Title: {note.title}")
        
except Exception as e:
    print(f"Yinxiang Error: {e}")
