// go script that fetches modules from app/modules.go atomOne file and output
// them into a json array.
//
// Usage: go run ./scripts/fetch_sdk_modules.go -- ./atomone/app/modules.go
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"log"
	"os"
	"path/filepath"
	"slices"
	"strings"
)

// fetchSDKModules parses srcFile and expects to find a call to the
// `NewBasicManager` function. If found it iterates over the arguments to
// determine which SDK modules are used by the chain.
// Typical srcFile is `app/modules.go where `NewBasicManager` is usually
// invoked.
func fetchSDKModules(srcFile string) ([]string, error) {
	fset := token.NewFileSet()
	bz, err := os.ReadFile(srcFile)
	if err != nil {
		return nil, err
	}
	f, err := parser.ParseFile(fset, srcFile, bz, 0)
	if err != nil {
		return nil, err
	}
	var modNames []string
	ast.Inspect(f, func(n ast.Node) bool {
		if call, ok := n.(*ast.CallExpr); ok {
			if sel, ok := call.Fun.(*ast.SelectorExpr); ok {
				if sel.Sel.Name == "NewBasicManager" {
					// Found the call to NewBasicManager, now check the arguments.
					for _, arg := range call.Args {
						switch arg := arg.(type) {
						case *ast.CompositeLit:
							name := arg.Type.(*ast.SelectorExpr).X.(*ast.Ident).Name
							modNames = append(modNames, name)
						case *ast.CallExpr:
							name := arg.Fun.(*ast.SelectorExpr).X.(*ast.Ident).Name
							modNames = append(modNames, name)
						}
					}
					return false // stop ast.Inspect
				}
			}
		}
		return true
	})
	if len(modNames) == 0 {
		// nothing found
		return nil, nil
	}
	slices.Sort(modNames)
	// Map modNames, which are module names or alias, to a list of module
	// paths, using the file imports.
	var modPaths []string
	for _, modName := range modNames {
		for _, imp := range f.Imports {
			path := imp.Path.Value
			path = path[1 : len(path)-1]              // remove quotes
			path = strings.TrimSuffix(path, "module") // remove potential extra module path
			impName := filepath.Base(path)
			if imp.Name != nil {
				// import use an alias
				impName = imp.Name.Name
			}
			if modName == impName {
				modPaths = append(modPaths, path)
			}
		}
	}
	return modPaths, nil
}

func main() {
	flag.Parse()
	mods, err := fetchSDKModules(flag.Arg(0))
	if err != nil {
		log.Fatal(err)
	}
	bz, err := json.MarshalIndent(mods, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(bz))
}
