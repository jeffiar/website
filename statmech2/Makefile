DOCS=index intro intro2 intro3 intro4 intro5

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
