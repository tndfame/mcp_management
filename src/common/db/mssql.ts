import mssql from "mssql";

let poolPromise: Promise<mssql.ConnectionPool> | null = null;

function getConfig(): mssql.config {
  const server = process.env.MSSQL_SERVER || process.env.DB_HOST || "";
  const database = process.env.MSSQL_DATABASE || process.env.DB_NAME || "";
  const user = process.env.MSSQL_USER || process.env.DB_USER || "";
  const password = process.env.MSSQL_PASSWORD || process.env.DB_PASSWORD || "";
  const port = Number(process.env.MSSQL_PORT || 1433);
  const encrypt =
    String(process.env.MSSQL_ENCRYPT || "true").toLowerCase() === "true";
  const trustServerCertificate =
    String(process.env.MSSQL_TRUST_SERVER_CERT || "false").toLowerCase() ===
    "true";

  return {
    server,
    database,
    user,
    password,
    port,
    options: {
      encrypt,
      trustServerCertificate,
    },
    pool: {
      max: 5,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  } as unknown as mssql.config;
}

export async function getPool(): Promise<mssql.ConnectionPool> {
  if (!poolPromise) {
    const cfg = getConfig();
    if (!cfg.server || !cfg.database || !cfg.user || !cfg.password) {
      throw new Error(
        "MSSQL config is incomplete. Please set MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USER, MSSQL_PASSWORD",
      );
    }
    poolPromise = new mssql.ConnectionPool(cfg).connect();
  }
  return poolPromise;
}

function mapJsToSqlType(val: any): mssql.ISqlTypeFactoryWithNoParams {
  if (typeof val === "number") return mssql.Int;
  if (typeof val === "boolean") return mssql.Bit;
  return mssql.NVarChar; // default for strings/others
}

// Very conservative check: allow only SELECT/WITH starting query (ignores leading whitespace)
export function isReadOnlySelect(sql: string): boolean {
  const s = sql.trim().toLowerCase();
  return s.startsWith("select") || s.startsWith("with");
}

export type QueryParams = Record<string, any>;

export async function queryReadOnly(
  sql: string,
  params?: QueryParams,
): Promise<{ rows: any[]; columns: string[] }> {
  if (!isReadOnlySelect(sql)) {
    throw new Error("Only read-only SELECT/WITH queries are allowed");
  }
  const pool = await getPool();
  const request = pool.request();
  if (params && typeof params === "object") {
    for (const [k, v] of Object.entries(params)) {
      request.input(k, mapJsToSqlType(v), v);
    }
  }
  const result = await request.query<any>(sql);
  const rows: any[] = (result.recordset as any[]) || [];
  const columns: string[] = rows[0] ? Object.keys(rows[0]) : [];
  return { rows, columns };
}
