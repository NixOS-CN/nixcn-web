{ pkgs, ...}:

{
  env.GREET = "devenv";

  packages = [
      pkgs.git
      pkgs.nodejs_22
      pkgs.corepack_22
      pkgs.prettier
      pkgs.typescript-language-server
  ];
}
