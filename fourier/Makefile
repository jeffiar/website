DOCS=index intro lec1 lec2 lec2b lec3a lec3b lec4 lec5 lec6 lec7

HDOCS=$(addsuffix .html, $(DOCS))
PHDOCS=$(HDOCS)

.PHONY : docs
docs : $(PHDOCS)

%.html : %.jemdoc MENU
	jemdoc -o $@ $<

.PHONY : clean
clean :
	-rm -f *.html
	-rm -r eqs/
