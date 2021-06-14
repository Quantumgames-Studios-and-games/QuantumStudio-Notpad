Phaser Editor 2D v3 - README
============================

Start the editor
================

Phaser Editor 2D v3 is a complete re-write of the editor.
Previous versions are based on the Eclipse IDE platform,
but v3 is based only on web technologies. This means,
the PhaserEditor2D.exe program is a server, and you should
open the IDE in a browser.

- To execute the editor as a local server, run:

$ PhaserEditor2D

By default, the server is executed as a local application. It is the recommended setup when you are working locally because:

	- It opens the default browser when it starts.
	- It allows opening the File Manager of the OS if the user requests it in the IDE.
	- It denies all remote connections.

- To execute the editor as a public server, run:

$ PhaserEditor2D -public

- If you prefer coding with a third-party tool, like VS Code, then you can disable the advanced JavaScript editor:

$ PhaserEditor2D -disable-advanced-js-editor

Disabling the JavaScript advanced tools reduces the usage of network, CPU, and memory,
so you may be interested in it if you have a lot o JavaScript files or a low-performing device.

- To see all options run:

$ PhaserEditor2D -help

- Also, you can set the options by adding them to the flags.txt file.

Help
====

The documentation of this version of the editor is complete.

https://help.phasereditor2d.com

Issues
======

If you find an issue or have a suggestion, please, file it in the GitHub repository of the project:

https://github.com/PhaserEditor2D/PhaserEditor2D-v3/issues

Or contact us at developers@phasereditor2d.com


Enjoy it!

Arian Fornaris
