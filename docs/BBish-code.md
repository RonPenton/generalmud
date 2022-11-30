We need a format to transmit rich text to the client. We want to avoid using HTML because of injection concerns. This game is highly input-based so there's a very large chance of injection attacks ocurring. 

Normally the answer is to use BBCode, but BBCode is too large and complex, we want to deal mostly with colors and typeface settings. But the basic idea of BBCode is good, we'll take the basic idea and keep only the parts we need. 

Codes: 

* b - bold
* i - italic
* u - underline
* lg - Large text
* sm - small text
* md - medium text
* c=FFF/FFFFFF - colored text
* b=FFF/FFFFFF - background colored text

Telnet was a streaming protocol, wherein command characters were inserted into the output stream to enable a text mode. In ANSO mode, if you injected a bright code, all text from that point forward was to be bright. Likewise you'd need to inject a dim code to go back to normal brightness. 

This will take a similar approach. A regular expression will be used to scan through text being rendered, and the text will be broken up into a number of runs, with each run applying the styles from the previous run. 