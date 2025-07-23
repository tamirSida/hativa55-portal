import { Tag, ITag, TagCategory, TagManager } from '@/models/Tag';
import { BaseService } from './BaseService';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';

export class TagService extends BaseService<Tag> {
  constructor() {
    super('tags');
  }

  protected fromFirestore(id: string, data: Record<string, unknown>): Tag {
    return Tag.fromFirestore(id, data);
  }

  public async createTag(tagData: Omit<ITag, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<string> {
    const tag = new Tag({
      ...tagData,
      usageCount: 0
    });
    return await this.create(tag.toFirestore() as Omit<Tag, 'id'>);
  }

  public async getTagsByCategory(category: TagCategory): Promise<Tag[]> {
    return await this.getByField('category', category, [
      where('isActive', '==', true),
      orderBy('usageCount', 'desc'),
      orderBy('name')
    ]);
  }

  public async getActiveTagsByUsage(limit = 50): Promise<Tag[]> {
    return await this.getByField('isActive', true, [
      orderBy('usageCount', 'desc'),
      orderBy('name')
    ]);
  }

  public async getTagByName(name: string): Promise<Tag | null> {
    const tags = await this.getByField('name', name);
    return tags.length > 0 ? tags[0] : null;
  }

  public async searchTags(searchTerm: string): Promise<Tag[]> {
    try {
      const allTags = await this.getByField('isActive', true, [orderBy('name')]);
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return allTags.filter(tag => 
        tag.name.toLowerCase().includes(lowercaseSearch) ||
        (tag.description && tag.description.toLowerCase().includes(lowercaseSearch))
      );
    } catch (error) {
      throw new Error(`Failed to search tags: ${error}`);
    }
  }

  public async incrementTagUsage(tagId: string): Promise<void> {
    const tag = await this.getById(tagId);
    if (!tag) throw new Error('Tag not found');

    tag.incrementUsage();
    await this.update(tagId, { 
      usageCount: tag.usageCount, 
      updatedAt: tag.updatedAt 
    });
  }

  public async decrementTagUsage(tagId: string): Promise<void> {
    const tag = await this.getById(tagId);
    if (!tag) throw new Error('Tag not found');

    tag.decrementUsage();
    await this.update(tagId, { 
      usageCount: tag.usageCount, 
      updatedAt: tag.updatedAt 
    });
  }

  public async getOrCreateTag(name: string, category: TagCategory): Promise<string> {
    if (!TagManager.isValidTagName(name)) {
      throw new Error('Invalid tag name');
    }

    const existingTag = await this.getTagByName(name);
    
    if (existingTag) {
      await this.incrementTagUsage(existingTag.id);
      return existingTag.id;
    }

    return await this.createTag({
      name,
      category,
      isActive: true
    });
  }

  public async getPopularTags(category?: TagCategory, limit = 20): Promise<Tag[]> {
    const constraints: QueryConstraint[] = [
      where('isActive', '==', true),
      orderBy('usageCount', 'desc')
    ];

    if (category) {
      constraints.unshift(where('category', '==', category));
    }

    return await this.getAll(constraints);
  }

  public async initializePredefinedTags(): Promise<void> {
    const predefinedTags = TagManager.getAllPredefinedTags();
    
    for (const [category, tags] of Object.entries(predefinedTags)) {
      for (const tagName of tags) {
        const existingTag = await this.getTagByName(tagName);
        
        if (!existingTag) {
          await this.createTag({
            name: tagName,
            category: category as TagCategory,
            isActive: true
          });
        }
      }
    }
  }

  public async toggleTagStatus(tagId: string): Promise<void> {
    const tag = await this.getById(tagId);
    if (!tag) throw new Error('Tag not found');

    tag.toggleActive();
    await this.update(tagId, { 
      isActive: tag.isActive, 
      updatedAt: tag.updatedAt 
    });
  }

  public async updateTagDescription(tagId: string, description: string): Promise<void> {
    const tag = await this.getById(tagId);
    if (!tag) throw new Error('Tag not found');

    tag.updateDescription(description);
    await this.update(tagId, { 
      description: tag.description, 
      updatedAt: tag.updatedAt 
    });
  }

  public async getUnusedTags(): Promise<Tag[]> {
    return await this.getByField('usageCount', 0, [
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    ]);
  }

  public async getMostUsedTagsInCategory(category: TagCategory, limit = 10): Promise<Tag[]> {
    return await this.getByField('category', category, [
      where('isActive', '==', true),
      where('usageCount', '>', 0),
      orderBy('usageCount', 'desc')
    ]);
  }

  public getPredefinedTagsForCategory(category: TagCategory): string[] {
    return TagManager.getPredefinedTags(category);
  }

  public getAllPredefinedTags(): Record<TagCategory, string[]> {
    return TagManager.getAllPredefinedTags();
  }
}