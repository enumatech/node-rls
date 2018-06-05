with (import <nixpkgs> {});

mkShell {
  buildInputs = [
    nodejs-8_x
    nodePackages_8_x.pnpm
  ];

  shellHook = ''
    export PATH=$(pwd)/node_modules/.bin:$PATH
  '';
}
