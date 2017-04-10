import { Component, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { BibliographicEntry } from '../locdb';
import { LocdbService } from '../locdb.service';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})

export class EntryFormComponent implements OnChanges {
  @Input() entry: BibliographicEntry;
  entryForm: FormGroup;

  @Output() state: EventEmitter<BibliographicEntry> = new EventEmitter()



  constructor(
    private fb: FormBuilder,
    private locdbService: LocdbService) { this.createForm(); }

  createForm() {
    this.entryForm = this.fb.group({
      bibliographicEntryText: '',
      // addresses: formModel.secretLairs // <-- bad!
      references: '',
      title: '',
      date: '',
      authors: this.fb.array([]),
    }
    )
  }

  ngOnChanges() {
    if (!this.entryForm || !this.entry) 
      return;
    this.entryForm.reset({
      title: this.entry.title,
      references: this.entry.references,
      date: this.entry.date,
      bibliographicEntryText: this.entry.bibliographicEntryText,
    });
    this.setAuthors(this.entry.authors)
  }

  setAuthors(authors: string[]) {
    const authorFGs = authors.map(author => this.fb.control(author));
    const authorFormArray = this.fb.array(authorFGs);
    // const authorFormArray = this.fb.array(authors);
    this.entryForm.setControl('authors', authorFormArray);
  }

  get authors(): FormArray {
    return this.entryForm.get('authors') as FormArray;
  };

  addAuthor(){
    this.authors.push(this.fb.control(""));
  }

  removeAuthor(idx: number) {
    let authors: string[] = this.authors.value;
    authors.splice(idx, 1);
    this.setAuthors(authors);
  }

  onSubmit() {
    this.entry = this.prepareSaveEntry();

    this.locdbService.putBibliographicEntry(this.entry._id, this.entry).subscribe(
      (result) => console.log("Error while submitting entry", result)
    );
    this.ngOnChanges();
  }

  prepareSaveEntry(): BibliographicEntry {
    const formModel = this.entryForm.value;
    // deep copy of form model lairs
    // const authorsDeepCopy: string[] = formModel.authors.map(
    //   (author: string) => Object.assign({}, author)
    // );
    const authorsDeepCopy = Object.create(formModel.authors);
    // return new `BibliographicEntry` object containing a combination of original entry value(s)
    // and deep copies of changed form model values
    const saveEntry: BibliographicEntry = {
      _id: this.entry._id,
      bibliographicEntryText: formModel.bibliographicEntryText as string,
      // addresses: formModel.secretLairs // <-- bad!
      references: formModel.references as string,
      title: formModel.title as string,
      date: formModel.date as string,
      authors: authorsDeepCopy
    };
    return saveEntry;
  }

  revert() { this.ngOnChanges(); }

  output() {
    const formModel = this.entryForm.value;
    const authorsDeepCopy = Object.create(formModel.authors);
    // copy from original entry
    let origEntry = this.entry;
    let current : BibliographicEntry = {
      _id: this.entry._id,
      coordinates: this.entry.coordinates,
      scanId: this.entry.scanId,
      status: this.entry.status,
      marker: this.entry.marker,
      bibliographicEntryText: formModel.bibliographicEntryText as string,
      references: formModel.references as string,
      title: formModel.title as string,
      date: formModel.date as string,
      authors: authorsDeepCopy
    };
    this.state.next(current);
  }

}