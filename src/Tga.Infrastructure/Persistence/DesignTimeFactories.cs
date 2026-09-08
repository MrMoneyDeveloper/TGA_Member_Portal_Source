using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace Tga.Infrastructure.Persistence;
public class DemoDesignFactory : IDesignTimeDbContextFactory<DemoDbContext> {
 public DemoDbContext CreateDbContext(string[] args)=>new(new DbContextOptionsBuilder<DemoDbContext>().UseSqlite(Environment.GetEnvironmentVariable("ConnectionStrings__Demo")??"Data Source=data/tga.db").Options,TimeProvider.System);
}
public class SqlServerDesignFactory : IDesignTimeDbContextFactory<SqlServerDbContext> {
 public SqlServerDbContext CreateDbContext(string[] args)=>new(new DbContextOptionsBuilder<SqlServerDbContext>().UseSqlServer(Environment.GetEnvironmentVariable("ConnectionStrings__SqlServer")??"Server=(localdb)\\mssqllocaldb;Database=Tga;Trusted_Connection=True;TrustServerCertificate=True").Options,TimeProvider.System);
}
