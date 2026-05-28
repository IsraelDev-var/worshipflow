/**
 * Base Repository genérico para todas las entidades
 * Proporciona métodos CRUD comunes
 */
export class BaseRepository<T> {
  constructor(private model: any) {}

  /**
   * Crear un registro
   */
  async create(data: Partial<T>): Promise<T> {
    return this.model.create({ data });
  }

  /**
   * Obtener por ID
   */
  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  /**
   * Obtener todos los registros
   */
  async findAll(where?: any, skip?: number, take?: number, orderBy?: any): Promise<T[]> {
    return this.model.findMany({
      where,
      skip,
      take,
      orderBy: orderBy ?? { createdAt: 'desc' },
    });
  }

  /**
   * Obtener el primero que coincida
   */
  async findFirst(where: any): Promise<T | null> {
    return this.model.findFirst({ where });
  }

  /**
   * Buscar por campo único
   */
  async findUnique(where: any): Promise<T | null> {
    return this.model.findUnique({ where });
  }

  /**
   * Actualizar
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * Actualizar múltiples registros
   */
  async updateMany(where: any, data: Partial<T>): Promise<any> {
    return this.model.updateMany({
      where,
      data,
    });
  }

  /**
   * Eliminar
   */
  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  /**
   * Eliminar múltiples
   */
  async deleteMany(where: any): Promise<any> {
    return this.model.deleteMany({ where });
  }

  /**
   * Contar registros
   */
  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * Obtener con paginación
   */
  async paginate(
    where?: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: T[];
    meta: { total: number; page: number; limit: number; pages: number };
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.model.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar con filtros avanzados
   */
  async search(where: any, include?: any, orderBy?: any): Promise<T[]> {
    return this.model.findMany({
      where,
      include,
      orderBy: orderBy || { createdAt: 'desc' },
    });
  }

  /**
   * Existe un registro
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Obtener con relaciones
   */
  async findWithRelations(id: string, include: any): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include,
    });
  }
}

/**
 * Factories para instanciar repositorios específicos
 */
export function createRepository<T>(model: any): BaseRepository<T> {
  return new BaseRepository<T>(model);
}
