import { z } from 'zod';

const NavItemSchema = z.object({
	enabled: z.boolean(),
	name: z.string(),
	icon: z.string().optional()
});

export const SiteConfigSchema = z.object({
	icon: z.string().optional(),
	title: z.string(),
	navigation: z.object({
		profile: NavItemSchema,
		projects: NavItemSchema,
		experience: NavItemSchema,
		skills: NavItemSchema,
		resume: NavItemSchema
	})
});
export type SiteConfig = z.infer<typeof SiteConfigSchema>;

// Hex color validation regex
const hexColorRegex = /^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{3})$/;
const hexMessage = "Color must be a valid hex color (e.g., #ff0000) 8, 6, 4, and 3 digit hex are supported."

// Contact schema
const ContactSchema = z.object({
	name: z.string(),
	link: z.string().url(),
	icon: z.string().optional(),
	color: z
		.string()
		.regex(hexColorRegex, hexMessage)
		.optional()
});
export const HomeConfigSchema = z.object({
	name: z.string(),
	description: z.string(),
	photo: z.string(),
	contact: z.array(ContactSchema)
});
export type HomeConfig = z.infer<typeof HomeConfigSchema>;

const SkillSchema = z.object({
	name: z.string(),
	icon: z.string().optional(),
	icon_size: z.number().optional(),
	color: z
		.string()
		.regex(hexColorRegex, hexMessage)
		.optional()
});

const SkillSectionSchema = z.object({
	name: z.string(),
	skill: z.array(SkillSchema)
});

export const SkillsConfigSchema = z.object({
	section: z.array(SkillSectionSchema)
});
export type SkillsConfig = z.infer<typeof SkillsConfigSchema>;

const ProjectTypeSchema = z.enum(['large', 'small']);
const ContentTypeSchema = z.enum(['title', 'text', 'image', 'model']);
const ProjectCellContentSchema = z.object({
	rows: z.number().min(1).max(10),
	cols: z.number().min(1).max(10),
	type: ContentTypeSchema,
	content: z.string(),
	text_color: z
		.string()
		.regex(hexColorRegex, hexMessage)
		.optional(),
	bg_color: z
		.string()
		.regex(hexColorRegex, hexMessage)
		.optional()
});
const ProjectSchema = z.object({
	type: ProjectTypeSchema,
	total_rows: z.number(),
	total_cols: z.number(),
	bg_color: z
		.string()
		.regex(hexColorRegex, hexMessage)
		.optional(),
	border_color: z
		.string()
		.regex(hexColorRegex, hexMessage)
		.optional(),
	shadow_color: z
		.string()
		.regex(hexColorRegex, hexMessage)
		.optional(),
	grid_item: z.array(ProjectCellContentSchema)
});
export const ProjectsConfigSchema = z.object({
	project: z.array(ProjectSchema)
});
export type ContentType = z.infer<typeof ContentTypeSchema>;
export type ProjectConfig = z.infer<typeof ProjectSchema>;
export type ProjectsConfig = z.infer<typeof ProjectsConfigSchema>;

export const ResumeConfigSchema = z.object({
	title: z.string(),
	url: z.string()
});
export type ResumeConfig = z.infer<typeof ResumeConfigSchema>;

const ExperienceSectionSchema = z.object({
	company: z.string(),
	position: z.string(),
	timeline: z.string(),
	project: z.array(ProjectSchema)
});
export const ExperienceConfigSchema = z.object({
	experience: z.array(ExperienceSectionSchema)
});
export type ExperienceConfig = z.infer<typeof ExperienceConfigSchema>;
