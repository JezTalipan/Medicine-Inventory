using System.Text;
using MedicineInventory.Api.Data;
using MedicineInventory.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Local overrides (connection string, JWT key) live here and are gitignored.
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

const string FrontendCorsPolicy = "Frontend";
var allowedOrigins =
    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000"];

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default"))
);

builder.Services.AddScoped<ITokenService, TokenService>();

var jwtSection = builder.Configuration.GetSection("Jwt");
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.")
                )
            ),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
    options.AddPolicy(
        FrontendCorsPolicy,
        policy => policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()
    )
);

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Jez Meds API", Version = "v1" });

    options.AddSecurityDefinition(
        JwtBearerDefaults.AuthenticationScheme,
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Paste the token returned by /api/auth/login.",
        }
    );

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document, null)] =
            new List<string>(),
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Skipped in development: an HTTPS redirect breaks CORS preflight from the http:// dev server.
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
