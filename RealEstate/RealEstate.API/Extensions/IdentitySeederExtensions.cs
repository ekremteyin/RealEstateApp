
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using RealEstate.Infrastructure.Identity; 

namespace RealEstate.API.Extensions
{
    public static class IdentitySeederExtensions
    {
        public static async Task SeedIdentityAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var sp = scope.ServiceProvider;

            var userMgr = sp.GetRequiredService<UserManager<AppUser>>();
            var roleMgr = sp.GetRequiredService<RoleManager<IdentityRole<int>>>();

            
            foreach (var r in new[] { "Admin", "User" })
            {
                if (!await roleMgr.RoleExistsAsync(r))
                    await roleMgr.CreateAsync(new IdentityRole<int>(r));
            }

            
            async Task EnsureUser(string username, string pass, string role)
            {
                var u = await userMgr.FindByNameAsync(username);
                if (u == null)
                {
                    u = new AppUser { UserName = username };
                    var res = await userMgr.CreateAsync(u, pass);
                    if (!res.Succeeded)
                        throw new Exception(string.Join("; ", res.Errors.Select(e => e.Description)));
                }
                
                if (!await userMgr.IsInRoleAsync(u!, role))
                    await userMgr.AddToRoleAsync(u!, role);
            }

            await EnsureUser("admin", "Admin123!", "Admin");
            await EnsureUser("demo", "User123!", "User");
        }
    }
}
