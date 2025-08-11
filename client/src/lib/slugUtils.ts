// Utility functions for converting service names to URL-friendly slugs

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

export function slugToName(slug: string): string {
  return slug
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Function to find service by slug from a list of services
export function findServiceBySlug(services: any[], slug: string): any | undefined {
  return services.find(service => nameToSlug(service.name) === slug);
}

// Function to get service ID by slug
export function getServiceIdBySlug(services: any[], slug: string): number | undefined {
  const service = findServiceBySlug(services, slug);
  return service?.id;
}