import { LanguageSupport } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { rust } from '@codemirror/lang-rust';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

export interface CodeLanguage {
  id: string;
  label: string;
  extension: LanguageSupport;
  defaultCode: string;
}

export const codeLanguages: CodeLanguage[] = [
  {
    id: 'javascript',
    label: 'JavaScript',
    extension: javascript(),
    defaultCode: `function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);`,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    extension: javascript({ typescript: true }),
    defaultCode: `interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = { name: 'World', age: 25 };
console.log(greet(user));`,
  },
  {
    id: 'python',
    label: 'Python',
    extension: python(),
    defaultCode: `def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    message = greet("World")
    print(message)`,
  },
  {
    id: 'java',
    label: 'Java',
    extension: java(),
    defaultCode: `public class HelloWorld {
    public static void main(String[] args) {
        String name = "World";
        System.out.println(greet(name));
    }

    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    extension: cpp(),
    defaultCode: `#include <iostream>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::string message = greet("World");
    std::cout << message << std::endl;
    return 0;
}`,
  },
  {
    id: 'go',
    label: 'Go',
    extension: go(),
    defaultCode: `package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    message := greet("World")
    fmt.Println(message)
}`,
  },
  {
    id: 'rust',
    label: 'Rust',
    extension: rust(),
    defaultCode: `fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    let message = greet("World");
    println!("{}", message);
}`,
  },
  {
    id: 'html',
    label: 'HTML',
    extension: html(),
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to my page.</p>
</body>
</html>`,
  },
  {
    id: 'css',
    label: 'CSS',
    extension: css(),
    defaultCode: `.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
    padding: 2rem;
    border-radius: 1rem;
    background: white;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}`,
  },
];

export function getCodeLanguageById(id: string): CodeLanguage {
  return codeLanguages.find((lang) => lang.id === id) || codeLanguages[0];
}
