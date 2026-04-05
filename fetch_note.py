import inspect
if not hasattr(inspect, "getargspec"):
    inspect.getargspec = inspect.getfullargspec

from evernote.api.client import EvernoteClient
import evernote.edam.notestore.NoteStore as NoteStore

dev_token = "S=s37:U=159e77f:E=19d6ffda9e2:C=19d4bf124a0:P=1cd:A=en-devtoken:V=2:H=4ed22390f3565292023967edb6ce05e4"
try:
    client = EvernoteClient(token=dev_token, sandbox=False, service_host='app.yinxiang.com')
    note_store = client.get_note_store()
    
    filter = NoteStore.NoteFilter()
    filter.words = "intitle:迪康兄初次通话"
    
    result_spec = NoteStore.NotesMetadataResultSpec(includeTitle=True)
    notes_meta = note_store.findNotesMetadata(dev_token, filter, 0, 1, result_spec)
    
    if notes_meta.notes:
        note_guid = notes_meta.notes[0].guid
        # Get content
        note = note_store.getNote(dev_token, note_guid, True, False, False, False)
        print("TITLE:", note.title)
        print("CONTENT:")
        print(note.content)
    else:
        print("Note not found.")
        
except Exception as e:
    print(f"Error: {e}")
