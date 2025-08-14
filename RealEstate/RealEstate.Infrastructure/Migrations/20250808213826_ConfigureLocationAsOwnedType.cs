using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureLocationAsOwnedType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Longitude",
                table: "Estates",
                newName: "Location_Longitude");

            migrationBuilder.RenameColumn(
                name: "Latitude",
                table: "Estates",
                newName: "Location_Latitude");

            migrationBuilder.AlterColumn<double>(
                name: "Location_Longitude",
                table: "Estates",
                type: "float(9)",
                precision: 9,
                scale: 6,
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Location_Latitude",
                table: "Estates",
                type: "float(9)",
                precision: 9,
                scale: 6,
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location_AddressDetail",
                table: "Estates",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Location_City",
                table: "Estates",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Location_Country",
                table: "Estates",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Location_District",
                table: "Estates",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location_AddressDetail",
                table: "Estates");

            migrationBuilder.DropColumn(
                name: "Location_City",
                table: "Estates");

            migrationBuilder.DropColumn(
                name: "Location_Country",
                table: "Estates");

            migrationBuilder.DropColumn(
                name: "Location_District",
                table: "Estates");

            migrationBuilder.RenameColumn(
                name: "Location_Longitude",
                table: "Estates",
                newName: "Longitude");

            migrationBuilder.RenameColumn(
                name: "Location_Latitude",
                table: "Estates",
                newName: "Latitude");

            migrationBuilder.AlterColumn<decimal>(
                name: "Longitude",
                table: "Estates",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float(9)",
                oldPrecision: 9,
                oldScale: 6);

            migrationBuilder.AlterColumn<decimal>(
                name: "Latitude",
                table: "Estates",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float(9)",
                oldPrecision: 9,
                oldScale: 6);
        }
    }
}
