import { Component, inject, input, OnDestroy, OnInit, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogComponent } from '../dialog/dialog.component';
import { FieldsetModule } from 'primeng/fieldset';
import { TagComponent } from '../tag/tag.component';
import { TagCategoryMapping, TagEntity } from 'libs/index';
import { ApiService } from '../../services/api.service';
import { NgTemplateOutlet } from '@angular/common';
import { Subscription } from 'rxjs';
import { EditorTagsComponent } from '../../../editors/editor-tags/editor-tags.component';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

type TagWrapper = { tag: TagEntity; checked: boolean };
type TagTree = { label: string; collapsed: boolean; tags: TagWrapper[]; children: TagTree[] };

const ALL = 'All Remaining ';

@Component({
  selector: 'app-tag-picker',
  imports: [
    ButtonModule,
    DialogComponent,
    FieldsetModule,
    TagComponent,
    EditorTagsComponent,
    CheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    NgTemplateOutlet,
  ],
  templateUrl: './tag-picker.component.html',
  styleUrl: './tag-picker.component.scss',
})
export class TagPickerComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);

  editorVisible = input(false);
  mode = input.required<'editor' | 'selector'>();
  selectedTags = input<TagEntity[]>([]);
  filterBool = input<keyof TagEntity | ''>('');
  filterBoardGame = input<string>();

  closeEditor = output<TagEntity[]>();

  title = 'Tags';

  editorTagVisible = false;
  editTag?: TagEntity;

  tags: TagTree[] = [];

  subscriptions = new Subscription();

  getSelected() {
    const tags = new Set<TagEntity>();
    this.crawlTagTree((t) => tags.add(t.tag));
    return [...tags].toSorted((a, b) => a.Text.localeCompare(b.Text));
  }

  getSelectedCount() {
    return this.getSelected().length;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.api.dataUpdate$.subscribe(() => {
        const tags = this.updateTagOptions();
        this.tags = [];
        if (this.mode() === 'editor') {
          this.buildEditorTree(tags);
        } else {
          this.buildSelectorTree(tags);
        }

        this.crawlTagTree(undefined, (item) => {
          const bgLabel = this.api.boardGames.getOne(item.label);
          if (bgLabel) {
            item.label = bgLabel?.Name ?? item.label;
          } else if (item.label in TagCategoryMapping) {
            item.label = TagCategoryMapping[item.label as keyof typeof TagCategoryMapping].text;
          } else {
            // Keep as is
          }
        });
        this.crawlTagTree(undefined, (item) => item.tags.sort((a, b) => a.tag.Text.localeCompare(b.tag.Text)));
        this.sortSections();
        this.crawlTagTree(undefined, (item) => {
          item.label += ` (${this.getCount(item)})`;
        });

        this.updateTitle();
      }),
    );
  }

  buildEditorTree(tags: TagWrapper[]) {
    tags.forEach((tag) => {
      const boardGames = tag.tag.BoardGameFilter.length > 0 ? tag.tag.BoardGameFilter : [ALL];
      boardGames.forEach((bg) => {
        let root = this.searchTagTree(this.tags, bg);
        if (root) {
          // Continue
        } else {
          root = { label: bg, collapsed: bg !== ALL, tags: [], children: [] };
          this.tags.push(root);
        }
        let category = this.searchTagTree([root], tag.tag.Category ?? ALL);
        if (category) {
          // Continue
        } else {
          category = { label: tag.tag.Category ?? ALL, collapsed: false, tags: [], children: [] };
          root.children.push(category);
        }

        category.tags.push(tag);
      });
    });
  }

  buildSelectorTree(tags: TagWrapper[]) {
    tags.forEach((tag) => {
      let category = this.searchTagTree(this.tags, tag.tag.Category ?? ALL);
      if (category) {
        // Continue
      } else {
        category = { label: tag.tag.Category ?? ALL, collapsed: false, tags: [], children: [] };
        this.tags.push(category);
      }

      category.tags.push(tag);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateTagOptions(): TagWrapper[] {
    let tags = this.api.tags.raw;
    const tagIds = new Set(this.selectedTags().map((x) => x.TagId));
    if (this.filterBool() === '') {
      // Skip filter
    } else {
      tags = tags.filter((x) => x[this.filterBool() as keyof TagEntity]);
    }

    tags = tags.filter(
      (x) =>
        this.filterBoardGame() === undefined ||
        x.BoardGameFilter.length === 0 ||
        x.BoardGameFilter.some((bg) => bg === this.filterBoardGame()),
    );

    this.selectedTags().forEach((t) => {
      if (tags.includes(t)) {
        // Continue
      } else {
        tags.push(t);
      }
    });

    tags.sort((a, b) => a.Text.localeCompare(b.Text));
    return tags.map((tag) => ({ tag, checked: tagIds.has(tag.TagId) }));
  }

  tagEdit(mouseEvent: MouseEvent, tag: TagWrapper) {
    if (this.mode() === 'editor') {
      this.editTag = tag.tag;
      this.editorTagVisible = true;
    } else {
      mouseEvent.preventDefault();
      tag.checked = !tag.checked;
      this.updateTitle();
    }
  }

  newTag() {
    this.editTag = new TagEntity({ Text: 'Example' });
    this.editorTagVisible = true;
  }

  unselectAll() {
    this.crawlTagTree((t) => (t.checked = false));
    this.updateTitle();
  }

  updateTitle() {
    const count = this.getSelectedCount();
    if (count > 0) {
      this.title = `Tags: ${count} selected`;
    } else {
      this.title = `Tags`;
    }
  }

  getCount(tree: TagTree): number {
    return tree.tags.length + tree.children.reduce((prev, curr) => prev + this.getCount(curr), 0);
  }

  crawlTagTree(tagAction: (_: TagWrapper) => void = () => {}, sectionAction: (_: TagTree) => void = () => {}) {
    const toSearch = [...this.tags];
    while (toSearch.length > 0) {
      const item = toSearch.pop();
      if (item) {
        item.tags.forEach((t) => {
          if (t.checked) {
            tagAction(t);
          } else {
            // Skip
          }
        });
        toSearch.push(...(item.children ?? []));
        sectionAction(item);
      } else {
        // Skip
      }
    }
  }

  searchTagTree(root: TagTree[], label: string) {
    const toSearch = [...root];
    while (toSearch.length > 0) {
      const item = toSearch.splice(0, 1)[0];
      if (item?.label === label) {
        return item;
      } else {
        toSearch.push(...(item?.children ?? []));
      }
    }
    return undefined;
  }

  sortSections() {
    const sort = (a: TagTree, b: TagTree) => {
      if (a.label === ALL) {
        return 1;
      } else if (b.label === ALL) {
        return -1;
      } else {
        return a.label.localeCompare(b.label);
      }
    };
    this.tags.sort(sort);
    this.crawlTagTree(undefined, (item) => item.children.sort(sort));
  }
}
