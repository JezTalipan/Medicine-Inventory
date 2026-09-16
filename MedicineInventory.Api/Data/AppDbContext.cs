using MedicineInventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MedicineInventory.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Medicine> Medicines => Set<Medicine>();
    public DbSet<Sale> Sales => Set<Sale>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasIndex(u => u.Username).IsUnique();
            entity.Property(u => u.Username).HasMaxLength(50);
            entity.Property(u => u.PasswordHash).HasMaxLength(200);
            entity.Property(u => u.DisplayName).HasMaxLength(100);
            entity.Property(u => u.Role).HasMaxLength(20);
        });

        modelBuilder.Entity<Medicine>(entity =>
        {
            entity.ToTable("Medicines");
            entity.Property(m => m.Name).HasMaxLength(200);
            entity.Property(m => m.GenericName).HasMaxLength(200);
            entity.Property(m => m.Category).HasMaxLength(100);
            entity.Property(m => m.Supplier).HasMaxLength(200);
            entity.Property(m => m.UnitPrice).HasPrecision(10, 2);
        });

        modelBuilder.Entity<Sale>(entity =>
        {
            entity.ToTable("Sales");
            entity.Property(s => s.TotalAmount).HasPrecision(12, 2);

            entity
                .HasOne(s => s.Medicine)
                .WithMany(m => m.Sales)
                .HasForeignKey(s => s.MedicineId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
