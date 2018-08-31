interface DependencyOptions {
  dev?: boolean;
}

// Some things will be app-dependent. This is similar to what we have in
// Sewing Kit, and in fact should probably just be a single thing that
// is shared between the two of them. I also show here how, given that it
// is managing the "app" domain, it would make sense to have things like
// package installation managed here. Just like the file system abstraction,
// this gives you more flexibility to build up changes iteratively.
export default class App {
  private newDependencies = new Set<string>();
  private newDevDependencies = new Set<string>();

  get componentDirectories() {
    return [
      'app/components',
      'app/sections/Home/Home/components',
    ];
  }

  get usesGraphQL() {
    return true;
  }

  constructor(private root: string) {}

  async commit() {
    // Install dependencies
  }

  install(dependency: string, options: DependencyOptions = {}) {
    if (this.hasDependency(dependency, options)) {
      return;
    }

    if (options.dev) {
      this.newDevDependencies.add(dependency);
    } else {
      this.newDependencies.add(dependency);
    }
  }

  hasDependency(dependency: string, options?: DependencyOptions) {
    return false;
  }
}
